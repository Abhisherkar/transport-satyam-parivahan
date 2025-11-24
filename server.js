const express=require("express");
const cors=require("cors");
const nodemailer=require("nodemailer");
const twilio=require("twilio");
require("dotenv").config();
const app=express();
app.use(cors());
app.use(express.json());
function createTransport(){
  const host=process.env.SMTP_HOST||"";
  const port=Number(process.env.SMTP_PORT||"0");
  const user=process.env.SMTP_USER||"";
  const pass=process.env.SMTP_PASS||"";
  if(!host||!port||!user||!pass)return null;
  return nodemailer.createTransport({host,port,secure:port===465,auth:{user,pass}});
}
function createTwilio(){
  const sid=process.env.TWILIO_ACCOUNT_SID||"";
  const token=process.env.TWILIO_AUTH_TOKEN||"";
  if(!sid||!token)return null;
  return twilio(sid,token);
}
function buildEmail(type,payload){
  const to=process.env.EMAIL_TO||"";
  const from=process.env.EMAIL_FROM||process.env.SMTP_USER||"";
  const fromEmail=(payload&&payload.fromEmail)||"";
  const name=(payload&&payload.name)||"";
  const subject=(type||"event").toUpperCase()+" Notification"+(name?` - ${name}`:"");
  const body=JSON.stringify(payload||{},null,2);
  const mail={from,to,subject,text:body};
  if(fromEmail){mail.replyTo=fromEmail;}
  return mail;
}
function buildWhatsappMessage(type,payload){
  const from=process.env.TWILIO_WHATSAPP_FROM||"";
  const to=process.env.WHATSAPP_TO||"";
  if(!from||!to)return null;
  const body=type.toUpperCase()+": "+Object.entries(payload).map(([k,v])=>`${k}: ${typeof v==="string"?v:JSON.stringify(v)}`).join(" | ");
  return {from:"whatsapp:"+from,to:"whatsapp:"+to,body};
}
app.post("/api/notify",async(req,res)=>{
  const {type,payload}=req.body||{};
  const transporter=createTransport();
  const client=createTwilio();
  let emailSent=false;let waSent=false;
  try{if(transporter){await transporter.sendMail(buildEmail(type||"event",payload||{}));emailSent=true;}}catch(e){emailSent=false}
  try{const msg=buildWhatsappMessage(type||"event",payload||{});if(client&&msg){await client.messages.create(msg);waSent=true;}}catch(e){waSent=false}
  res.json({ok:true,email:emailSent,whatsapp:waSent});
});
const port=process.env.PORT||5501;
app.listen(port,()=>{});
