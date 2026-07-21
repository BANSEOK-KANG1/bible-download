# Bible usage log API

앱에서 하루에 한 번 익명 사용 로그를 받는 Cloudflare Worker입니다.

## 배포

```bash
cd workers/usage-log
npm init -y
npm install wrangler --save-dev

# KV 네임스페이스 생성 후 wrangler.toml의 id/preview_id 갱신
npx wrangler kv namespace create USAGE_LOGS
npx wrangler kv namespace create USAGE_LOGS --preview

# API 키 (앱의 UsageLogConfig.API_KEY 와 동일해야 함)
npx wrangler secret put USAGE_API_KEY

npx wrangler deploy
```

## 수신

- 업로드: `POST /v1/log` (헤더 `X-API-Key`)
- 일별 조회: `GET /v1/export?day=2026-07-21&key=...`

배포 후 Worker URL을 앱 `UsageLogConfig.UPLOAD_URL`에 맞춥니다.
