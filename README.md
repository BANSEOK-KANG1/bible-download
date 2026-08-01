# 성경 앱 후원 QR → 다운로드 페이지

QR 코드를 스캔하면 후원 팝업이 뜨고, 후원 여부와 관계없이 **어르신도 따라 할 수 있는 설치 마법사**로 이동하는 정적 웹사이트입니다.

## 플로우

1. QR 코드 스캔 → `index.html` 진입
2. 후원 팝업 자동 표시 (선택 사항)
3. **설치하기** 또는 **바로 설치하기** → `download.html` 설치 마법사
4. 4단계 안내에 따라 설치 파일 받기 → 열기 → 설치 → 완료

> 어르신은 GitHub 사이트를 볼 일이 없습니다. APK는 GitHub Releases URL로 **직접 다운로드**만 됩니다.

## 어르신용 설치 마법사

`download.html`은 한 번에 한 단계씩만 보여 주는 4단계 안내입니다.

| 단계 | 내용 |
|------|------|
| 1 | **받기** — 설치 파일 다운로드 |
| 2 | 알림 또는 다운로드 폴더에서 파일 열기 |
| 3 | 설치 허용 후 설치 완료 |
| 4 | 앱 열기 안내 |

- 큰 글씨·큰 버튼 (최소 64px)
- 이전 / 다음으로 되돌아갈 수 있음
- 마지막 단계는 `localStorage`에 저장되어 나갔다 와도 이어서 볼 수 있음

### QR 포스터 문구 예시

```
성경 앱 설치
QR 코드를 찍고 '받기'만 누르세요
차례대로 안내해 드립니다
```

## 로컬 미리보기

```bash
cd bible-download
python3 -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속

> ES module을 사용하므로 `file://`로 직접 열면 동작하지 않을 수 있습니다. 위처럼 로컬 서버를 사용하세요.

## 설정 변경

[`js/config.js`](js/config.js) 한 파일만 수정하면 됩니다.

| 항목 | 설명 |
|------|------|
| `appName` | 앱 이름 |
| `bankName` | 은행명 |
| `accountHolder` | 예금주 |
| `accountNumber` | 계좌번호 |
| `bankCode` | 카카오페이 송금용 금융기관 코드 (카카오뱅크 `090`, 토스뱅크 `092`) |
| `tossBankName` | 토스 송금용 은행명 (`카카오뱅크`, `토스뱅크` 등) |
| `donationAmounts` | 후원 금액 선택지 (원 단위 배열) |
| `defaultDonationAmount` | 기본 선택 금액 |
| `transferMemo` | 토스 송금 시 받는 분에게 표시할 메모 |
| `apkUrl` | GitHub Releases APK 다운로드 URL (관리자용, 어르신에게 노출 안 됨) |
| `apkFileName` | 다운로드 파일 이름 (`성경앱.apk`) |
| `installSteps` | 설치 마법사 4단계 문구 |
| `helpText` | 하단 도움말 문구 |
| `helpPhone` | 도움 전화번호 (`tel:` 링크, 비우면 숨김) |
| `version` | 앱 버전 표시 |
| `siteUrl` | QR 코드가 가리킬 진입 URL |
| `apkSizeMb` | APK 용량 안내 (MB) |

### 예시

```javascript
export const CONFIG = {
  appName: "성경 앱",
  bankName: "카카오뱅크",
  accountHolder: "홍길동",
  accountNumber: "3333-01-1234567",
  bankCode: "090",
  tossBankName: "카카오뱅크",
  donationAmounts: [5000, 10000, 20000, 30000, 50000, 100000],
  defaultDonationAmount: 5000,
  transferMemo: "성경앱 후원",
  apkUrl: "https://github.com/myuser/bible-download/releases/latest/download/app-release.apk",
  version: "1.0.17",
  siteUrl: "https://myuser.github.io/bible-download/",
  apkSizeMb: 130,
};
```

후원 계좌가 **토스뱅크**라면 예시:

```javascript
bankName: "토스뱅크",
bankCode: "092",
tossBankName: "토스뱅크",
```

송금 버튼 동작:

- **토스로 보내기**: `supertoss://send?...` 딥링크로 토스 앱 송금 화면 열기
- **카카오페이로 보내기**: `kakaopay://money/to/bank?...` 딥링크로 카카오페이 송금 화면 열기
```

설정 변경 후 QR 코드를 다시 생성하세요:

```bash
chmod +x scripts/generate-qr.sh
./scripts/generate-qr.sh
```

## GitHub Pages + Releases 배포

### 1. 저장소 생성 및 push

```bash
cd bible-download
git init
git add .
git commit -m "Add bible app donation and download pages"
git branch -M main
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
```

### 2. GitHub Pages 활성화

1. GitHub 저장소 → **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main` / `/ (root)`
4. 저장 후 `https://USER.github.io/REPO/` 에서 사이트 확인

### 3. APK Release 업로드

APK 파일(현재 전체판 약 174MiB)은 GitHub Releases에 올립니다.

```bash
# APK 경로 (로컬 빌드 결과)
cp /path/to/bible/bible-app/app/build/outputs/apk/release/app-release.apk .
```

GitHub 웹 UI:

1. 저장소 → **Releases** → **Draft a new release**
2. Tag: `v1.0.17` (버전에 맞게)
3. Release title: `v1.0.17`
4. `app-release.apk` 파일 첨부
5. **Publish release**

다운로드 URL 형식:

```
https://github.com/USER/REPO/releases/latest/download/app-release.apk
```

이 URL을 `js/config.js`의 `apkUrl`에 넣습니다.

### 4. QR 코드 인쇄

1. `js/config.js`의 `siteUrl`을 실제 Pages URL로 수정
2. `./scripts/generate-qr.sh` 실행
3. `assets/qr-code.png`를 포스터·전단지에 사용

## 파일 구조

```
bible-download/
├── index.html          # QR 진입점 (후원 팝업)
├── download.html       # 어르신용 4단계 설치 마법사
├── css/style.css
├── js/
│   ├── config.js       # 설정
│   └── main.js         # 팝업·복사·이동 로직
├── assets/
│   └── qr-code.png     # 인쇄용 QR
├── scripts/
│   └── generate-qr.sh  # QR 재생성 스크립트
└── README.md
```

## 업데이트 시

1. 새 APK 빌드
2. GitHub에 새 Release 생성 후 APK 첨부
3. `config.js`의 `version`, `apkUrl` 수정
4. 필요 시 `./scripts/generate-qr.sh` 재실행
5. 변경사항 push → Pages 자동 반영
