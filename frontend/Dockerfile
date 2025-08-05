FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NEXT_PUBLIC_API_URL=https://invest.exonvc.ir
ENV NEXT_PUBLIC_WS_URL=wss://invest.exonvc.ir/ws

RUN npm run build

EXPOSE 3050

CMD ["npm", "start", "--", "-p", "3050"]
