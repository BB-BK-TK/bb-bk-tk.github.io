package com.daehwateum.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private static final String HOME = "https://bb-bk-tk.github.io/daehwateum/";
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#f6f1ea"));
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUserAgentString(settings.getUserAgentString() + " DaehwateumAndroid/0.1");

        webView.addJavascriptInterface(new ShareBridge(this), "AndroidShare");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (isDaehwateumUrl(uri)) {
                    return false;
                }
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (url != null && url.startsWith(HOME)) {
                    String js = "(function(){try{" +
                            "Object.defineProperty(navigator,'share',{configurable:true,value:function(d){AndroidShare.share((d&&d.url)||'');return Promise.resolve();}});" +
                            "}catch(e){window.daehwateumNativeShare=function(u){AndroidShare.share(u);};}})();";
                    view.evaluateJavascript(js, null);
                }
            }
        });

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            loadIntent(getIntent());
        }
    }

    private boolean isDaehwateumUrl(Uri uri) {
        return "https".equalsIgnoreCase(uri.getScheme())
                && "bb-bk-tk.github.io".equalsIgnoreCase(uri.getHost())
                && uri.getPath() != null
                && uri.getPath().startsWith("/daehwateum/");
    }

    private void loadIntent(Intent intent) {
        Uri data = intent != null ? intent.getData() : null;
        if (data != null && isDaehwateumUrl(data)) {
            webView.loadUrl(data.toString());
        } else {
            webView.loadUrl(HOME);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        loadIntent(intent);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    public static class ShareBridge {
        private final Context context;

        ShareBridge(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public void share(String url) {
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("text/plain");
            send.putExtra(Intent.EXTRA_SUBJECT, "대화틈 7일");
            send.putExtra(Intent.EXTRA_TEXT, "7일 동안 하루 한 질문씩 같이 해볼래?\n" + url);
            context.startActivity(Intent.createChooser(send, "초대하기"));
        }
    }
}
