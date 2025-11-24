const nodemailer=require("nodemailer");
const twilio=require("twilio");

module.exports=async (req,res)=>{
  if(req.method!=="POST"){res.status(405).json({error:"Method Not Allowed"});return;}
  const {type,payload}=req.body||{};
  const emailTo=process.env.EMAIL_TO||"";
  const emailFrom=process.env.EMAIL_FROM||process.env.SMTP_USER||"";
  const smtpHost=process.env.SMTP_HOST||"";
  const smtpPort=Number(process.env.SMTP_PORT||"0");
  const smtpUser=process.env.SMTP_USER||"";
  const smtpPass=process.env.SMTP_PASS||"";
  const twilioSid=process.env.TWILIO_ACCOUNT_SID||"";
  const twilioToken=process.env.TWILIO_AUTH_TOKEN||"";
  const waFrom=process.env.TWILIO_WHATSAPP_FROM||"";
  const waTo=process.env.WHATSAPP_TO||"";

  let email=false, whatsapp=false;

  try{
    if(smtpHost&&smtpPort&&smtpUser&&smtpPass&&emailTo){
      const transporter=nodemailer.createTransport({host:smtpHost,port:smtpPort,secure:smtpPort===465,auth:{user:smtpUser,pass:smtpPass}});
      const subject=(type||"event").toUpperCase()+" Notification"+(payload&&payload.name?` - ${payload.name}`:"");
      const mail={from:emailFrom,to:emailTo,subject,text:JSON.stringify(payload||{},null,2)};
      if(payload&&payload.fromEmail){mail.replyTo=String(payload.fromEmail);
      }
      await transporter.sendMail(mail);
      email=true;
    }
  }catch(e){email=false}

  try{
    if(twilioSid&&twilioToken&&waFrom&&waTo){
      const client=twilio(twilioSid,twilioToken);
      const body=(type||"event").toUpperCase()+": "+Object.entries(payload||{}).map(([k,v])=>`${k}: ${typeof v==="string"?v:JSON.stringify(v)}`).join(" | ");
      await client.messages.create({from:"whatsapp:"+waFrom,to:"whatsapp:"+waTo,body});
      whatsapp=true;
    }
  }catch(e){whatsapp=false}

  res.status(200).json({ok:true,email,whatsapp});
}
