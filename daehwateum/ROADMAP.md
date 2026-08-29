# 대화틈 Roadmap

## Product thesis
대화틈은 질문 소비 앱이 아니라, 두 사람 사이에 대화가 쌓이고 다시 돌아올 수 있는 작은 관계 공간이다.

## P0 — 7-day private beta
Goal: 두 사람이 7일 동안 실제로 다시 돌아오는지와, 7일 후 돈을 내고 이어갈 의향이 있는지 검증한다.

### Experience
- 이름만 입력하고 공간 생성
- 상대방 링크 초대
- 하루 1개 질문, 총 7일
- 각자 답변 → 둘 다 답하면 → 직접 `서로의 답 열어보기`
- Round/Day에 날짜 표시
- 완료한 날을 주간/월간 캘린더에 표시
- 같은 기기에서는 여러 대화틈을 보관하고 다시 열기
- 자기 초대 링크를 다시 열어도 self-join하지 않고 기존 공간으로 복귀
- Day 7 종료 후 각자 주간 회고
  - 이번 주 대화하면서 좋았던 점은?
  - 다음 주엔 무엇이 조금 달랐으면 좋겠어요?
- 두 사람 모두 회고를 제출하면 함께 공개

### Monetization test
- 첫 7일 무료
- 종료 후 `7일 더 이어가기 · ₩2,900` fake-door 노출
- P0에서는 실제 결제하지 않음
- paywall_view / paywall_click / price_feedback 이벤트 기록
- 정식 결제 도입 전 willingness-to-pay만 검증

### P0 success metrics
1. Invite acceptance rate: 생성된 공간 중 두 번째 사람이 참여한 비율
2. Day 1 completion: 둘 다 첫 답을 완료한 비율
3. D2 / D4 / D7 pair retention: 그 날까지 둘 다 대화를 채운 비율
4. 7-day completion rate: 7개 질문 완료 비율
5. Reflection completion: 7일 완료 pair 중 두 사람 모두 회고한 비율
6. Paywall CTR: 회고 완료 pair 중 `7일 더 이어가기` 클릭 비율
7. Price sentiment: 괜찮아요 vs 조금 비싸요

## P1 — Expression + brand-supported layer
Goal: 답변 공개 이후 실제 행동/표현으로 연결하면서 광고가 관계 경험을 해치지 않는지 검증한다.

### Experience
- 답변 공개 후 `내 마음을 표현해볼까요?`
- 말/작은 행동/선물 등 표현 아이디어
- 그 아래 1개의 clearly-labeled branded slot
- 광고는 대화 본문을 직접 타게팅하지 않고, contextual/general sponsorship을 기본 원칙으로 함
- 광고 노출, 클릭, dismiss, expression CTA 전환 측정

### Potential partners
- 꽃/작은 선물
- 식음료/데이트
- 사진/포토북
- 경험형 선물/예약

## P2 — Paid “우리 대화 분석하기”
Goal: 누적 대화에서 사용자가 가치 있다고 느끼는 insight를 유료 기능으로 제공한다.

### Candidate outputs
- 이번 달 자주 나온 주제
- 서로가 고마워한 순간
- 반복해서 나온 바람/필요
- 서로 다르게 느낀 지점
- 다음 주에 해볼 수 있는 작은 대화 제안
- 월간 관계 리캡

### Guardrails
- 누가 맞고 틀렸는지 판정하지 않음
- 관계/정신건강 진단을 하지 않음
- 두 사람의 공유 대화를 AI 분석에 쓰기 전 명확한 opt-in
- 광고 타게팅에 raw private answers를 사용하지 않음
- 분석 결과는 원문을 대체하지 않고, 언제든 실제 답변 기록으로 돌아갈 수 있게 함

## P3 — Sustainable paid model
가격은 P0 데이터 이후 결정.

Candidate model:
- Free: 첫 7일
- Micro-extension: 7일 추가 ₩2,900 / $1.99 one-time
- Monthly: 반복 사용자가 생기면 약 $4.99–5.99/month 검토
- Annual: 충분한 retention 이후에만 검토
- Premium analysis: monthly plan 또는 별도 paid report로 실험

## Explicitly not building yet
- 복잡한 회원가입
- streak 경쟁/포인트
- 많은 게임/퀴즈
- 커뮤니티 피드
- 관계 점수
- AI 코치 상시 채팅

P0에서 가장 중요한 질문은 하나다: `첫 질문 이후 두 사람이 스스로 다시 돌아오는가?`
