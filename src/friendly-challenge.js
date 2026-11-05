/* Exact user-selected recording. Playback stays in the existing sound controls. */
const challengeRecording={banks:new WeakMap(),source:null,epoch:0,
 load(ctx){let bank=this.banks.get(ctx);if(bank)return bank;bank=fetch('https://sunny-lotus.github.io/manabiquest/common/audio/seika-two-loops.mp3').then(r=>{if(!r.ok)throw Error('音源を読み込めませんでした');return r.arrayBuffer()}).then(bytes=>ctx.decodeAudioData(bytes));this.banks.set(ctx,bank);bank.catch(()=>this.banks.delete(ctx));return bank;},
 start(){const ctx=gameAudio.ctx;if(!ctx||ctx.state!=='running'||!soundPrefs.bgm||document.hidden||gameAudio.scene!=='battle'||this.source)return;const epoch=this.epoch;
  this.load(ctx).then(buffer=>{if(epoch!==this.epoch||this.source||ctx!==gameAudio.ctx||ctx.state!=='running'||!soundPrefs.bgm||document.hidden||gameAudio.scene!=='battle')return;
   const source=ctx.createBufferSource(),env=ctx.createGain();source.buffer=buffer;source.loop=true;source.loopStart=0;source.loopEnd=Math.min(320/3,buffer.duration);env.gain.setValueAtTime(0,ctx.currentTime);env.gain.linearRampToValueAtTime(.7,ctx.currentTime+.08);audioVoice(source,env,gameAudio.music,true);const ended=source.onended;source.onended=()=>{if(ended)ended();if(this.source===source)this.source=null;};this.source=source;source.start(ctx.currentTime+.02);
  }).catch(()=>{const el=document.querySelector('#soundSettings,#pveSound');if(el)el.title='音源を読み込めませんでした。もう一度BGMをONにしてください。';});
 },
 stop(){this.epoch++;const source=this.source;this.source=null;if(source)try{source.stop()}catch{}}
};
const challengePreviousStart=startGameMusic,challengePreviousStop=stopGameMusic;
startGameMusic=function(){if(gameAudio.scene==='battle'){challengeRecording.start();return;}challengePreviousStart();};
stopGameMusic=function(){challengeRecording.stop();challengePreviousStop();};

paths.sword=paths.spark;
const sharingSound=playGameSound;playGameSound=function(kind){return sharingSound(kind==='attack'||kind==='hit'?'charge':kind);};
const sharingTurn=BattleTurn.observe;BattleTurn.observe=function(){if(state.page==='battle'&&state.battle?.phase==='result'&&state.battle.winner!==null){const el=document.querySelector('#battleTurn');if(el){if(el.textContent!=='ふたりの学びに拍手！')el.textContent='ふたりの学びに拍手！';return;}}sharingTurn.call(this);};
BattleVictory.observe=function(){if(!this.ready()){document.querySelector('#victoryBanner')?.remove();return;}const arena=document.querySelector('.game-arena');if(!arena)return;let banner=document.querySelector('#victoryBanner');if(!banner){banner=document.createElement('div');banner.id='victoryBanner';banner.className='victory-banner';banner.setAttribute('role','status');banner.innerHTML='<strong>おたがいに拍手！</strong><small>またいっしょにチャレンジしよう</small>';arena.append(banner);}if(banner.style.left!=='50%')banner.style.left='50%';if(banner.style.top!=='12px')banner.style.top='12px';document.querySelectorAll('.team-side').forEach(el=>{if(!el.classList.contains('victory-team'))el.classList.add('victory-team');});};
ChampionsSound.action=function(choice,m){playGameSound(choice==='guard'||choice==='support'||m.shield?'guard':m.heal||m.regen?'correct':'charge');};
const friendlyChampionsRender=render;
render=function(){friendlyChampionsRender();const b=state.battle;if(state.page!=='battle'||!b)return;
 document.querySelectorAll('.versus,.intro-vs').forEach(el=>el.textContent='🤝');
 const finished=b.phase==='result'&&b.winner!==null;
 document.querySelectorAll('.status-bar-row>span').forEach(el=>{if(el.textContent==='HP')el.textContent='げんき';});
 document.querySelectorAll('.status-bar-row [aria-label]').forEach(el=>el.setAttribute('aria-label',el.getAttribute('aria-label').replaceAll('HP','げんき')));
 if(finished){document.querySelector('.battle-frame')?.classList.add('challenge-finished');let p=document.querySelector('.challenge-applause');if(!p){p=document.createElement('p');p.className='challenge-applause';p.setAttribute('role','status');p.textContent='👏 ふたりとも、すてきなチャレンジ！';document.querySelector('.game-arena')?.after(p);}
 const heading=document.querySelector('.result-heading');if(heading)heading.textContent='ふたりの学びに拍手！';
 const turn=document.querySelector('#battleTurn');if(turn)turn.textContent='ふたりの学びに拍手！';
 const banner=document.querySelector('#victoryBanner');if(banner){banner.style.left='50%';banner.style.top='12px';banner.querySelector('strong').textContent='おたがいに拍手！';banner.querySelector('small').textContent='またいっしょにチャレンジしよう';}
 }
};
render();
