// school-rush-renderer.js
// Pseudo-3D renderer for School Rush

function polygon(c, points, fill, stroke, width=1) {
  c.beginPath();c.moveTo(points[0].x,points[0].y);
  for(let i=1;i<points.length;i++)c.lineTo(points[i].x,points[i].y);
  c.closePath();c.fillStyle=fill;c.fill();
  if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}

function triangle(c,image,s0,s1,s2,d0,d1,d2){
  const sx1=s1.x-s0.x,sy1=s1.y-s0.y,sx2=s2.x-s0.x,sy2=s2.y-s0.y;
  const determinant=sx1*sy2-sx2*sy1;
  const dx1=d1.x-d0.x,dy1=d1.y-d0.y,dx2=d2.x-d0.x,dy2=d2.y-d0.y;
  const a=(dx1*sy2-dx2*sy1)/determinant,b=(dy1*sy2-dy2*sy1)/determinant;
  const cc=(dx2*sx1-dx1*sx2)/determinant,d=(dy2*sx1-dy1*sx2)/determinant;
  c.save();c.beginPath();c.moveTo(d0.x,d0.y);c.lineTo(d1.x,d1.y);c.lineTo(d2.x,d2.y);c.closePath();c.clip();
  c.transform(a,b,cc,d,d0.x-a*s0.x-cc*s0.y,d0.y-b*s0.x-d*s0.y);
  
  // Set globalCompositeOperation to multiply to drop the white background
  c.globalCompositeOperation = 'multiply';
  c.drawImage(image,0,0);
  c.restore();
}

function quadImage(c,image,points){
  if (!image || !image.complete) return;
  const a={x:0,y:0},b={x:image.width,y:0},d={x:0,y:image.height},e={x:image.width,y:image.height};
  triangle(c,image,a,b,e,points[0],points[1],points[2]);
  triangle(c,image,a,e,d,points[0],points[2],points[3]);
}
const depthOrder=(a,b)=>a.z-b.z;

function createPainter(canvas, sprites) {
  const c = canvas.getContext('2d',{alpha:false});
  if(!c)throw new Error('Canvas 2D is unavailable');
  let width=1,height=1,dpr=1,horizon=1,focal=1,eye=1,ceiling=6;
  const items=Array.from({length:112},()=>({active:false,z:0,x:0,y:0,image:null,w:1,h:1,shadow:false}));
  function project(x,y,z){const scale=focal/Math.max(1,10-z);return {x:width/2+x*scale,y:horizon+(eye-y)*scale,scale};}
  function surface(x0,y0,z0,x1,y1,z1,color,stroke){
    polygon(c,[project(x0,y0,z0),project(x1,y0,z1),project(x1,y1,z1),project(x0,y1,z0)],color,stroke);
  }
  function wallImage(image,side,z,span,bottom,top){
    if(z+span/2>7.8||z<-115)return;
    const near=z+span/2,far=z-span/2;
    const zz=side<0?[near,far]:[far,near];
    quadImage(c,image,[project(side*4.48,top,zz[0]),project(side*4.48,top,zz[1]),project(side*4.48,bottom,zz[1]),project(side*4.48,bottom,zz[0])]);
  }
  function resize(w,h){
    width=w;height=h;dpr=Math.min(window.devicePixelRatio||1,1.75);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    focal=Math.min(h*1.06,w*1.84);horizon=h*0.28;
    eye=(h*0.81-horizon)*10/focal;ceiling=Math.max(5.2,eye+0.72);
  }
  function render(r,status){
    c.setTransform(dpr,0,0,dpr,0,0);c.imageSmoothingEnabled=true;
    c.fillStyle='#e7ece5';c.fillRect(0,0,width,height);
    const far=-140,near=9;
    polygon(c,[project(-4.5,0,near),project(-4.5,0,far),project(4.5,0,far),project(4.5,0,near)],'#dce5e2');
    polygon(c,[project(-4.5,ceiling,near),project(-4.5,ceiling,far),project(4.5,ceiling,far),project(4.5,ceiling,near)],'#f6f8ef');
    for(const side of [-1,1]){
      surface(side*4.5,0,near,side*4.5,ceiling,far,side<0?'#f0f1e8':'#e4edeb');
      surface(side*4.495,0.1,near,side*4.495,1.36,far,side<0?'#97b8ac':'#a7bdae');
      surface(side*4.49,1.34,near,side*4.49,1.42,far,'#527d76');
      surface(side*4.49,0,near,side*4.49,0.13,far,'#55716c');
    }
    c.strokeStyle='#b8bbad';c.lineWidth=1;
    for(let z=-135+(r.distance%3);z<9;z+=3){const a=project(-4.5,0,z),b=project(4.5,0,z);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
    for(let x=-4.5;x<=4.5;x+=1.5){const a=project(x,0,far),b=project(x,0,near);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
    surface(-4.5,0,-138,4.5,ceiling,-138,'#d5ded1');
    const start=Math.floor(r.distance/18);
    for(let i=8;i>=0;i--){
      const serial=start+i,z=4-i*18+(r.distance%18);
      if(z<8){
        polygon(c,[project(-4.5,ceiling,z-0.06),project(4.5,ceiling,z-0.06),project(4.5,ceiling,z+0.06),project(-4.5,ceiling,z+0.06)],'#c3cec3');
        polygon(c,[project(-1.4,ceiling-0.035,z-1.1),project(1.4,ceiling-0.035,z-1.1),project(1.4,ceiling-0.035,z-0.65),project(-1.4,ceiling-0.035,z-0.65)],'#d0d6cc','#9fafaa');
        polygon(c,[project(-1.25,ceiling-0.05,z-1.01),project(1.25,ceiling-0.05,z-1.01),project(1.25,ceiling-0.05,z-0.73),project(-1.25,ceiling-0.05,z-0.73)],'#fffdf0');
      }
      wallImage(sprites.wallLockers,-1,z-2,4.0,0,3.95);
      wallImage(sprites.wallLockers,1,z-10,4.0,0,3.95);
    }
    let count=0;
    function put(image,x,y,z,w,h,shadow=true){
      if(z>8||z<-120||count===items.length||!image)return;
      const item=items[count++];Object.assign(item,{active:true,image,x,y,z,w,h,shadow});
    }
    const runFrame=Math.floor(r.distance*1.45)%8,coinFrame=Math.floor(r.elapsed*10)%8;
    for(const row of r.rows){
      for(const o of row.obstacles){
        if(!o.active)continue;
        // 0=Recycle bin (high/solid), 1=Wet floor sign (low)
        if(o.type === 0) put(sprites.recycleBin, SchoolRushEngine.LANES[o.lane], 0, row.z, 1.85, 2.5);
        else if(o.type === 1) put(sprites.wetFloorSign, SchoolRushEngine.LANES[o.lane], 0, row.z, 1.68, 2.85);
        else put(sprites.recycleBin, SchoolRushEngine.LANES[o.lane], 0, row.z, 1.85, 2.5);
      }
      for(const coin of row.coins) {
        if(coin.active) put(sprites.sunCoin, SchoolRushEngine.LANES[coin.lane], 0.74+Math.sin(r.elapsed*3+coin.offset)*0.04, row.z+coin.offset, 0.8, 0.8, false);
      }
    }
    const duck=r.slide>0&&r.y<0.05;
    put(sprites.boyRunning, r.x, r.y, 0, 1.5, duck ? 1.0 : 2.0, true);
    
    for(let i=count;i<items.length;i++){items[i].active=false;items[i].z=-10000;}
    items.sort(depthOrder);
    for(const item of items){
      if(!item.active)continue;
      const foot=project(item.x,item.y,item.z),scale=foot.scale;
      if(item.shadow){
        const ground=project(item.x,0,item.z);
        c.fillStyle='#49665a26';c.beginPath();c.ellipse(ground.x,ground.y,item.w*scale*0.37,scale*0.1,0,0,Math.PI*2);c.fill();
      }
      const w=item.w*scale,h=item.h*scale;
      if(item.image===sprites.boyRunning&&r.flash>0){c.save();c.globalAlpha=0.65+0.35*Math.abs(Math.sin(r.elapsed*20));}
      
      c.save();
      // Drop white background using multiply blend mode
      c.globalCompositeOperation = 'multiply';
      c.drawImage(item.image,foot.x-w/2,foot.y-h,w,h);
      c.restore();
      
      if(item.image===sprites.boyRunning&&r.flash>0)c.restore();
    }
    if(status==='running'&&r.y===0){
      const foot=project(r.x,0,0);c.fillStyle='#f3eee48a';
      for(let i=0;i<3;i++){const t=(r.distance*0.7+i/3)%1;c.beginPath();c.ellipse(foot.x+(i-1)*9,foot.y+t*22,3+t*8,2+t*4,0,0,Math.PI*2);c.fill();}
    }
    if(r.flash>0){c.strokeStyle=`rgba(217,91,65,${r.flash*0.9})`;c.lineWidth=10;c.strokeRect(4,4,width-8,height-8);}
  }
  return {resize,render,dispose(){items.length=0;canvas.width=0;canvas.height=0;}};
}

function loadSprites() {
  const images = {};
  const paths = {
    boyRunning: 'assets/img/games/school-rush/boy_running.jpg',
    sunCoin: 'assets/img/games/school-rush/sun_coin.jpg',
    wallLockers: 'assets/img/games/school-rush/wall_lockers.jpg',
    wetFloorSign: 'assets/img/games/school-rush/wet_floor_sign.jpg',
    recycleBin: 'assets/img/games/school-rush/recycle_bin.jpg'
  };

  let loaded = 0;
  const total = Object.keys(paths).length;
  
  return new Promise((resolve) => {
    for (const [key, path] of Object.entries(paths)) {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        images[key] = img;
        loaded++;
        if (loaded === total) resolve(images);
      };
      img.onerror = () => {
        console.error('Failed to load ' + path);
        loaded++;
        if (loaded === total) resolve(images);
      }
    }
  });
}

window.SchoolRushRenderer = {
  createPainter,
  loadSprites
};
