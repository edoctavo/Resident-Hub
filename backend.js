/* Replaces the claude.ai storage/login with Supabase, keeping the same interface the app expects. */
(function(){
 var bad=/YOUR-PROJECT|YOUR_ANON/.test(CFG.SUPABASE_URL+CFG.SUPABASE_ANON_KEY);
 var sb=bad?null:supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY),uid=null,urls={};
 window.sb=sb||{auth:{signOut:function(){return Promise.resolve()}}};
 var ready=sb?sb.auth.getSession().then(function(r){uid=r.data.session?r.data.session.user.id:null}):Promise.resolve();
 window.claude={use:function(n){return ready.then(function(){
  if(!uid)return null;
  if(n==="user")return{id:function(){return Promise.resolve(uid)}};
  if(n==="db")return{collection:function(){return{doc:function(k){return{
   get:function(){return sb.from("module_docs").select("items,current").eq("key",k).maybeSingle().then(function(r){if(r.error)throw r.error;return{exists:!!r.data,data:function(){return r.data}}})},
   set:function(v){return sb.from("module_docs").upsert({user_id:uid,key:k,items:v.items,current:v.current||null,updated_at:new Date().toISOString()},{onConflict:"user_id,key"}).then(function(r){if(r.error)throw r.error})}}}}}};
  if(n==="assets")return{upload:function(blob){var id=crypto.randomUUID();return sb.storage.from("files").upload(uid+"/"+id,blob,{contentType:blob.type||"image/jpeg"}).then(function(r){if(r.error)throw r.error;return{id:id}})}};
  if(n==="downloads")return{save:function(o){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([o.data],{type:"application/json"}));a.download=o.filename;a.click();return Promise.resolve()}};
  return null;
 })}};
 /* private images: fetch short-lived signed URLs */
 window.sign=function(id){if(urls[id])return Promise.resolve(urls[id]);return sb.storage.from("files").createSignedUrl(uid+"/"+id,3600).then(function(r){return urls[id]=r.data&&r.data.signedUrl})};
 function fill(){document.querySelectorAll("img[data-z]:not([data-ok])").forEach(function(im){im.setAttribute("data-ok","1");window.sign(im.getAttribute("data-z")).then(function(u){if(u)im.src=u})})}
 document.addEventListener("DOMContentLoaded",function(){new MutationObserver(fill).observe(document.body,{childList:true,subtree:true})});
 var $=function(i){return document.getElementById(i)};
 window.authScreen=function(){
  $("nav").innerHTML='<div class="brand">Resident Hub</div>';
  if(bad){$("main").innerHTML='<div class="gate"><h1>Almost there</h1><p style="color:var(--mute)">Open <b>config.js</b> and paste in your Supabase project URL and anon key. The README has the steps.</p></div>';return}
  $("main").innerHTML='<div class="gate"><h1>Resident Hub</h1><p style="color:var(--mute)">Log in, or create an account to use the hub on all your devices.</p><div class="form" style="grid-template-columns:1fr"><label>Email<input id="em" type="email" autocomplete="email"></label><label>Password (8+ characters)<input id="pw" type="password" autocomplete="current-password"></label><div><button class="btn" id="li">Log in</button> <button class="btn ghost" id="su">Create account</button> <button class="lk" id="fp">Forgot password?</button></div><div id="am" class="m"></div></div></div>';
  var say=function(t){$("am").textContent=t},em=function(){return $("em").value.trim()};
  $("li").onclick=function(){sb.auth.signInWithPassword({email:em(),password:$("pw").value}).then(function(r){r.error?say(r.error.message):location.reload()})};
  $("su").onclick=function(){var pw=$("pw").value;if(pw.length<8){say("Use at least 8 characters.");return}sb.auth.signUp({email:em(),password:pw}).then(function(r){if(r.error)say(r.error.message);else if(r.data.session)location.reload();else say("Account created. Check your email to confirm it, then log in.")})};
  $("fp").onclick=function(){if(!em()){say("Enter your email first.");return}sb.auth.resetPasswordForEmail(em(),{redirectTo:location.origin+location.pathname}).then(function(r){say(r.error?r.error.message:"Password reset email sent.")})};
 };
 if(sb)sb.auth.onAuthStateChange(function(ev){if(ev==="PASSWORD_RECOVERY")setTimeout(function(){
  $("main").innerHTML='<div class="gate"><h1>Set a new password</h1><div class="form" style="grid-template-columns:1fr"><label>New password (8+ characters)<input id="np" type="password" autocomplete="new-password"></label><div><button class="btn" id="sp">Save password</button></div><div id="am" class="m"></div></div></div>';
  $("sp").onclick=function(){var p=$("np").value;if(p.length<8){$("am").textContent="Use at least 8 characters.";return}sb.auth.updateUser({password:p}).then(function(r){r.error?$("am").textContent=r.error.message:location.replace(location.pathname)})};
 },1200)});
})();
