(()=>{
const canvas=document.querySelector('#board'),ctx=canvas.getContext('2d'),scoreEl=document.querySelector('#score'),bestEl=document.querySelector('#best'),status=document.querySelector('#status');
const W=canvas.width,H=canvas.height,worldW=1460,gravity=.48;
const platforms=[{x:0,y:318,w:360},{x:405,y:280,w:135},{x:585,y:238,w:145},{x:780,y:270,w:130},{x:960,y:224,w:150},{x:1150,y:298,w:310}];
const initialCrystals=[{x:150,y:280},{x:440,y:244},{x:630,y:202},{x:824,y:234},{x:1012,y:188},{x:1244,y:262}];
const keys={left:false,right:false};let player,crystals,score=0,best=+(localStorage.platformerBest||0),camera=0,done=false,raf;
bestEl.textContent=best;
function reset(){cancelAnimationFrame(raf);player={x:38,y:270,w:23,h:28,vx:0,vy:0,grounded:false};crystals=initialCrystals.map(c=>({...c,taken:false}));score=0;camera=0;done=false;scoreEl.textContent='0';status.textContent='Reach the flag. Grab crystals on the way!';frame()}
function jump(){if(player.grounded&&!done){player.vy=-10.4;player.grounded=false}}
function move(){if(keys.left)player.vx-=.48;if(keys.right)player.vx+=.48;if(!keys.left&&!keys.right)player.vx*=.78;player.vx=Math.max(-4.2,Math.min(4.2,player.vx));const previousY=player.y;player.x=Math.max(0,Math.min(worldW-player.w,player.x+player.vx));player.vy=Math.min(11,player.vy+gravity);player.y+=player.vy;player.grounded=false;
for(const p of platforms){if(player.vy>=0&&previousY+player.h<=p.y&&player.y+player.h>=p.y&&player.x+player.w>p.x&&player.x<p.x+p.w){player.y=p.y-player.h;player.vy=0;player.grounded=true}}
if(player.y>H+80){player.x=38;player.y=270;player.vx=player.vy=0;status.textContent='Back at the start — go get that flag!'}
for(const c of crystals){if(!c.taken&&player.x<c.x+13&&player.x+player.w>c.x-13&&player.y<c.y+13&&player.y+player.h>c.y-13){c.taken=true;score++;scoreEl.textContent=score;if(score>best){best=score;localStorage.platformerBest=best;bestEl.textContent=best}}}
if(player.x>1340&&!done){done=true;status.textContent='Flag reached! '+score+' crystal'+(score===1?'':'s')+' collected. Play again?'}
camera=Math.max(0,Math.min(worldW-W,player.x-190));
}
function draw(){ctx.fillStyle='#171e24';ctx.fillRect(0,0,W,H);
ctx.fillStyle='#202e32';for(let i=0;i<12;i++){const x=(i*137-camera*.22)%(W+90);ctx.fillRect(x,40+(i*43)%130,4,4)}
ctx.fillStyle='#263b3d';ctx.beginPath();ctx.moveTo(0,288);for(let x=0;x<=W+80;x+=100)ctx.lineTo(x,245+Math.sin((x+camera*.15)/95)*22);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
for(const p of platforms){const x=p.x-camera;if(x+p.w<0||x>W)continue;ctx.fillStyle='#435b58';ctx.fillRect(x,p.y,p.w,H-p.y+20);ctx.fillStyle='#83ad97';ctx.fillRect(x,p.y,p.w,7);ctx.fillStyle='#344744';for(let bx=x+12;bx<x+p.w-4;bx+=27)ctx.fillRect(bx,p.y+18,12,5)}
for(const c of crystals){if(c.taken)continue;const x=c.x-camera;if(x<-20||x>W+20)continue;ctx.fillStyle='#bb896d';ctx.beginPath();ctx.moveTo(x,c.y-9);ctx.lineTo(x+8,c.y);ctx.lineTo(x,c.y+9);ctx.lineTo(x-8,c.y);ctx.closePath();ctx.fill();ctx.fillStyle='#e2b68f';ctx.fillRect(x-2,c.y-4,3,3)}
const fx=1355-camera;ctx.fillStyle='#a2aaa7';ctx.fillRect(fx,236,4,62);ctx.fillStyle='#bd8790';ctx.beginPath();ctx.moveTo(fx+4,238);ctx.lineTo(fx+33,248);ctx.lineTo(fx+4,259);ctx.fill();
const px=player.x-camera;ctx.fillStyle='#8fc4aa';ctx.fillRect(px,player.y,player.w,player.h);ctx.fillStyle='#38554d';ctx.fillRect(px+5,player.y+7,4,4);ctx.fillRect(px+15,player.y+7,4,4);ctx.fillStyle='#d6e3d9';ctx.fillRect(px+6,player.y+19,12,3);
}
function frame(){if(!done)move();draw();if(!done)raf=requestAnimationFrame(frame)}
function setAction(action,on){if(action==='left'||action==='right')keys[action]=on;else if(action==='jump'&&on)jump()}
document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.left=true;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.right=true;if(e.key==='ArrowUp'||e.key===' '||e.key.toLowerCase()==='w')jump()});
document.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.left=false;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.right=false});
document.querySelectorAll('[data-action]').forEach(button=>{const action=button.dataset.action;button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);setAction(action,true)});button.addEventListener('pointerup',()=>setAction(action,false));button.addEventListener('pointercancel',()=>setAction(action,false))});
document.querySelector('#restart').addEventListener('click',reset);reset();
})();
