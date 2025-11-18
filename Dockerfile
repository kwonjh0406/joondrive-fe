# Node.js 22 베이스 이미지 사용
FROM node:22-alpine AS base

# 의존성 설치 단계
FROM base AS deps
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package.json package-lock.json* ./

# 의존성 설치
RUN npm ci --legacy-peer-deps

# 빌드 단계
FROM base AS builder
WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 환경 변수 설정 (빌드 시 필요)
ENV NEXT_TELEMETRY_DISABLED 1

# 프로덕션 빌드
RUN npm run build

# 프로덕션 실행 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 시스템 사용자 생성 (보안을 위해 root 사용 방지)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드 결과물 및 의존성 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]

