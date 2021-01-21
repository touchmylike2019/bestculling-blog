---
title: 'Next.js — JWT auth example app'
date: '2020-01-02'
---

ตัวอย่างของแอป Next.js โดยใช้ SSR (การแสดงผลฝั่งเซิร์ฟเวอร์) ไปยังหน้าที่มีการป้องกันภายใต้การเข้าสู่ระบบและการพูดคุยกับและเซิร์ฟเวอร์ Express.js API ผ่านการพิสูจน์ตัวตน JWT

<img src="https://miro.medium.com/max/7500/1*F6zXcbadNAgByCBl1HWR8A.jpeg">

**Project Structure**

จะมีสองโฟลเดอร์ หนึ่งคือเซิร์ฟเวอร์และอีกอันคือแอป เซิร์ฟเวอร์หนึ่งจะมีแอป Express ในขณะที่อีกเซิร์ฟเวอร์หนึ่งจะมีแอป Nextjs ทั้งสองจะรันบนพอร์ตของตัวเอง App / Client บน 3000 และ Express / Api บน 3001

**Server side**

มาสร้างฝั่งเซิร์ฟเวอร์ก่อน เริ่มก่อนด้วยแอป Express.js มาตรฐาน สร้างในโฟลเดอร์เซิร์ฟเวอร์

```javascript
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3001;

// Middleware

// JSON parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/ping", (req, res) => {
  // random endpoint so that the client can call something
  res.json({ "msg": "pong" })
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
```

เนื่องจากไคลเอนต์ของเราเขียนด้วย JavaScript ด้วยเราจึงต้องจัดการกับ CORS คุณสามารถใช้ไลบรารีแฟนซีหรือเพิ่มตรรกะด้วยตัวเองก็ได้ เพียงเพิ่มบรรทัดของรหัสนี้

```javascript
    //...

// CORS middleware
app.use(function (req, res, next) {
  // Allow Origins
  res.header("Access-Control-Allow-Origin", "*");
  // Allow Methods
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  // Allow Headers
  res.header("Access-Control-Allow-Headers", "Origin, Accept, Content-Type, Authorization");
  // Handle preflight, it must return 200
  if (req.method === "OPTIONS") {
    // Stop the middleware chain
    return res.status(200).end();
  }
  // Next middleware 
  next();
});

//...
```

ตอนนี้เราเพิ่มการสนับสนุน JWT ฉันใช้ไลบรารี jsonwebtoken

โปรดทราบว่าเพื่อรักษาความลับของคุณให้ปลอดภัยในไฟล์. env และอย่าผลักดันให้เข้าสู่คอมไพล์ นี่เป็นเพียงตัวอย่างเท่านั้น

ฉันกำหนดรหัสมิดเดิลแวร์ที่กำหนดเองซึ่งจะตรวจสอบการอนุญาตส่วนหัวหากมีค่าอยู่ตรวจสอบความถูกต้องแล้วตัดสินใจว่าจะดำเนินการตามคำขอต่อไปหรือบล็อกและส่งคืน 401 Not Authorized กลับ ไม่จำเป็นต้องตรวจสอบเส้นทาง API สำหรับการเข้าสู่ระบบเนื่องจากเส้นทางนั้นจะไม่มีการตั้งค่าส่วนหัว

```javascript
    //...
const jwt = require('jsonwebtoken');
const jwtSecret = "mysuperdupersecret"; // Use env for secrets
//...

// Auth middleware
app.use((req, res, next) => {
  // login does not require jwt verification
  if (req.path == '/api/login') {
    // next middleware
    return next()
  }

  // get token from request header Authorization
  const token = req.headers.authorization

  // Token verification
  try {
    var decoded = jwt.verify(token, jwtSecret);
    console.log("decoded", decoded)
  } catch (err) {
    // Catch the JWT Expired or Invalid errors
    return res.status(401).json({ "msg": err.message })
  }

  // next middleware
  next()
});
```

สุดท้ายเรามาเพิ่มเส้นทางที่ลูกค้าสามารถโทรหาได้

```javascript
    // Routes
app.get("/api/login", (req, res) => {
  // generate a constant token, no need to be fancy here
  const token = jwt.sign({ "username": "Mike" }, jwtSecret, { expiresIn: 60 }) // 1 min token
  // return it back
  res.json({ "token": token })
});

app.get("/api/token/ping", (req, res) => {
  // Middleware will already catch if token is invalid
  // so if he can get this far, that means token is valid
  res.json({ "msg": "all good mate" })
})

app.get("/api/ping", (req, res) => {
  // random endpoint so that the client can call something
  res.json({ "msg": "pong" })
});
```

เส้นทางการเข้าสู่ระบบจะสร้างโทเค็น JWT คงที่ซึ่งจะหมดอายุตั้งไว้ที่ 1 นาที

เส้นทางการปิงโทเค็นเราต้องการเส้นทางนี้สำหรับ Next.js SSR รหัส Next.js ในขณะที่ทำ SSR จะต้องตรวจสอบโทเค็นอย่างใดอย่างหนึ่งมิฉะนั้นจะแสดงหน้า "ความลับ" (ผู้ใช้ที่ไม่ได้รับรองความถูกต้องไม่สามารถเข้าถึงได้) แสดงให้ผู้ใช้เห็นจากนั้นแสดงหน้าอื่นอีกครั้งในฝั่งไคลเอ็นต์ (เช่นเข้าสู่ระบบ) เมื่อพบว่าผู้ใช้ไม่ควรเห็นความลับ ดังนั้นในขณะที่ทำการตรวจสอบโทเค็นบน SSR ของ Nextjs live cycle แอปสามารถแสดงหน้าที่ถูกต้องให้กับผู้ใช้ตั้งแต่เริ่มต้น พูดถึง Next.js …

**Client side**

สร้างแอพ Nextjs เหมือนปกติใน appfolder ตอนนี้สร้างโฟลเดอร์ apages และเพิ่มสองรายการต่อไปนี้:

```javascript
    import React from 'react';
import Link from 'next/link.js';
import axios from 'axios';
import { Cookies } from 'react-cookie';

const serverUrl = 'http://localhost:3001';

// set up cookies
const cookies = new Cookies();
class Index extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      token: cookies.get('token') || null
    }
  }

  onLoginClick = async () => {
    console.log("Login called");
    const response = await axios.get(serverUrl + '/api/login')
    const token = response.data.token;
    cookies.set('token', token);
    this.setState({
      token: token
    })
  }

  render() {
    return (
      <div>
        <h2>Main page</h2>
        <br></br>
        <button onClick={() => this.onLoginClick()}>Get Token</button>
        <br></br>
        <p>Token: {this.state.token}</p>
        <br></br>
        <Link href="/secret">
          <a>Secret page</a>
        </Link>
      </div >
    )
  }
}

export default Index;
```

หน้าดัชนีมีปุ่ม เมื่อคุณคลิกมันจะเรียก api / login endpoint ซึ่งจะส่งคืนโทเค็น จากนั้นโทเค็นจะถูกเก็บไว้ในคุกกี้ ฉันยังจัดเก็บไว้ในสถานะเพียงเพื่อแสดงบนหน้าเพื่อวัตถุประสงค์ในการสาธิต ดัชนียังมีลิงก์ไปยังเพจลับ มีลักษณะดังนี้:

```javascript
    import React from 'react';
import axios from 'axios';
import { Cookies } from 'react-cookie';
import { handleAuthSSR } from '../utils/auth';

const serverUrl = 'http://localhost:3001';

// set up cookies
const cookies = new Cookies();

class Secret extends React.Component {

  onPingCall = async (e) => {
    const token = cookies.get('token')

    try {
      const res = await axios.get(serverUrl + '/api/ping', { headers: { 'Authorization': token } });
      console.log(res.data.msg);
    } catch (err) {
      console.log(err.response.data.msg);
    }
  }

  render() {
    return (
      <div>
        <h2>Secret page</h2>
        <p>Only accessible via a valid JWT</p>
        <br></br>
        <button onClick={(e) => this.onPingCall(e)}>Ping Call</button>
        <p>Check console for response</p>
      </div>
    );
  }
}

// Server-Side Rendering
Secret.getInitialProps = async (ctx) => {
  // Must validate JWT
  // If the JWT is invalid it must redirect
  // back to the main page. You can do that
  // with Router from 'next/router
  await handleAuthSSR(ctx);

  // Must return an object
  return {}
}

export default Secret;
```

หน้าลับนี้สามารถดู / เข้าถึงได้ก็ต่อเมื่อมีโทเค็นที่ถูกต้องเท่านั้น
เราสามารถตรวจสอบสิ่งนี้ได้ใน functiongetInitialProps

handleAuthSSR ทำการตรวจสอบทั้งหมด ขึ้นอยู่กับบริบทที่กำหนดว่าเราเป็นฝั่งเซิร์ฟเวอร์หรือฝั่งไคลเอ็นต์จากนั้นจะได้รับค่าโทเค็น โปรดจำไว้ว่าแม้ว่าเราจะอยู่ฝั่งเซิร์ฟเวอร์ แต่เราไม่สามารถเข้าถึงคุกกี้หรือ localStorage และสิ่งอื่น ๆ ที่เกี่ยวข้องกับเบราว์เซอร์ได้ แต่มีเพียงคำขอและสิ่งที่ส่งมาเท่านั้น

จากการตอบสนองจาก api / token / ping เราไม่ได้ทำอะไรเลยหรือเราเปลี่ยนเส้นทางกลับไปที่การเข้าสู่ระบบในกรณีที่เกิดข้อผิดพลาด ตอนนี้ขึ้นอยู่กับว่าเราเป็นฝั่งเซิร์ฟเวอร์หรือฝั่งไคลเอ็นต์เราต้องเปลี่ยนเส้นทางด้วยวิธีที่ถูกต้อง

```javascript

    import axios from 'axios';
import Router from 'next/router';
import { Cookies } from 'react-cookie';
// set up cookies
const cookies = new Cookies();
const serverUrl = 'http://localhost:3001';

export async function handleAuthSSR(ctx) {
  let token = null;

  // if context has request info aka Server Side
  if (ctx.req) {
    // ugly way to get cookie value from a string of values
    // good enough for demostration
    token = ctx.req.headers.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  }
  else {
    // we dont have request info aka Client Side
    token = cookies.get('token')
  }

  try {
    const response = await axios.get(serverUrl + "/api/token/ping", { headers: { 'Authorization': token } });
    // dont really care about response, as long as it not an error
    console.log("token ping:", response.data.msg)
  } catch (err) {
    // in case of error
    console.log(err.response.data.msg);
    console.log("redirecting back to main page");
    // redirect to login
    if (ctx.res) {
      ctx.res.writeHead(302, {
        Location: '/'
      })
      ctx.res.end()
    } else {
      Router.push('/')
    }
  }
}

```

และนั่นก็คือการโคลน repo และเรียกใช้ตัวอย่างด้วยตัวคุณเองหากสิ่งนั้นช่วยให้คุณเข้าใจดีขึ้น

ดู Code ทั้งหมดได้ที่:
[https://github.com/zprima/jwt-cors-app](https://github.com/zprima/jwt-cors-app)

เครดิตจาก(Credit):
[https://anmagpie.medium.com/next-js-jwt-auth-example-app-4ea4d7f49fa3](https://anmagpie.medium.com/next-js-jwt-auth-example-app-4ea4d7f49fa3)

