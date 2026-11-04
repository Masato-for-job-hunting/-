(()=>{"use strict";
const byId=id=>document.getElementById(id);
const waitForData=(attempt=0)=>{
  const rows=(typeof DATA!=="undefined"&&Array.isArray(DATA))?DATA:null;
  if(!rows){if(attempt<20){setTimeout(()=>waitForData(attempt+1),150);return;}const r=byId("result");if(r)r.textContent="企業データを読み込めませんでした。再読み込みしてください。";return;}
  init(rows);
};
function init(rows){
 const C={"金融・保険業":"#0057D9","学術研究・専門・技術サービス業":"#F05A24","卸売・小売業":"#00A86B","情報通信業":"#7B2CBF","サービス業":"#00A6D6","製造業":"#D81B60","運輸・郵便業":"#F2B705","地方公務員":"#00897B","不動産・物品賃貸業":"#E84393","国家公務員":"#3949AB","教育・学習支援業":"#6BAA00","電気・ガス・熱供給・水道業":"#F57C00","建設業":"#8D5A2B","医療・福祉業":"#D32F2F"},F={"金融":"#0057D9","コンサル":"#F05A24","商社":"#00A86B"};
 const G={big4:["コンサル｜Big4",["デロイト","PwC","ＰｗＣ","EY","ＥＹ","KPMG","ＫＰＭＧ"]],mbb:["コンサル｜MBB",["マッキンゼー","ボストン・コンサルティング","BCG","ベイン・アンド・カンパニー"]],trading5:["商社｜5大商社",["三菱商事","三井物産","伊藤忠商事","住友商事","丸紅"]],megabanks:["銀行｜3メガバンク",["三菱ＵＦＪ銀行","三菱UFJ銀行","三井住友銀行","みずほ銀行"]],securities5:["証券｜5大証券",["野村證券","大和証券","ＳＭＢＣ日興証券","SMBC日興証券","みずほ証券","三菱ＵＦＪモルガン・スタンレー証券"]],thinktanks5:["シンクタンク｜主要5社",["野村総合研究所","三菱総合研究所","日本総合研究所","三菱ＵＦＪリサーチ＆コンサルティング","みずほリサーチ＆テクノロジーズ"]]};
 const pie=byId("pie"),legend=byId("legend"),sector=byId("sector"),focus=byId("focus"),preset=byId("preset"),info=byId("info")||byId("presetInfo"),query=byId("query"),bars=byId("bars"),result=byId("result"),more=byId("more"),apply=byId("apply"),reset=byId("reset"),quick=byId("quick")||byId("quickGroups");
 if(!sector||!focus||!query||!bars||!result||!apply||!reset){return;}
 const totals={};rows.forEach(d=>totals[d.sector]=(totals[d.sector]||0)+Number(d.total||0));const sectors=Object.entries(totals).sort((a,b)=>b[1]-a[1]),grand=sectors.reduce((s,x)=>s+x[1],0)||1;
 let run=0;if(pie)pie.style.background=`conic-gradient(${sectors.map(([n,v])=>{const a=run/grand*100;run+=v;return `${C[n]||"#6D7580"} ${a}% ${run/grand*100}%`}).join(",")})`;
 if(legend)legend.innerHTML=sectors.map(([n,v])=>`<div class="legend-row"><i class="dot" style="background:${C[n]||"#6D7580"}"></i><span>${n}</span><b>${v}人・${(v/grand*100).toFixed(1)}%</b></div>`).join("");
 sectors.forEach(([n])=>{if(![...sector.options].some(o=>o.value===n))sector.insertAdjacentHTML("beforeend",`<option value="${n}">${n}</option>`)});
 if(preset){Object.entries(G).forEach(([k,v])=>{if(![...preset.options].some(o=>o.value===k))preset.insertAdjacentHTML("beforeend",`<option value="${k}">${v[0]}</option>`)});}
 let filtered=[],shown=20;const gm=(name,k)=>!preset||k==="all"||!G[k]||G[k][1].some(x=>String(name).includes(x)||x.includes(String(name)));
 function filterRows(){const s=sector.value,f=focus.value,g=preset?preset.value:"all",q=query.value.trim().toLocaleLowerCase("ja");filtered=rows.filter(d=>(s==="all"||d.sector===s)&&(f==="all"||(f==="other"?!d.focus:d.focus===f))&&gm(d.name,g)&&(!q||String(d.name).toLocaleLowerCase("ja").includes(q))).sort((a,b)=>Number(b.total)-Number(a.total));shown=20;if(info){if(g!=="all"&&G[g]){const h=rows.filter(d=>gm(d.name,g));info.hidden=false;info.textContent=`${G[g][0]}：${h.length}社・延べ${h.reduce((a,d)=>a+Number(d.total||0),0)}人`;}else{info.hidden=true;info.textContent="";}}}
 function row(d,m){const y=Array.isArray(d.years)?d.years:[d.y2022,d.y2023,d.y2024,d.y2025];return `<div class="bar"><div class="name">${d.name}${d.focus?`<span class="tag" style="background:${F[d.focus]}">${d.focus}</span>`:""}<div class="years">2022 ${y[0]||0} / 2023 ${y[1]||0} / 2024 ${y[2]||0} / 2025 ${y[3]||0}</div></div><div class="track"><div class="fill" style="width:${Number(d.total)/m*100}%;background:${F[d.focus]||C[d.sector]||"#6D7580"}"></div></div><b>${d.total}</b></div>`;}
 function render(append=false,old=0){const m=Math.max(1,...filtered.map(d=>Number(d.total)||0));const html=(append?filtered.slice(old,shown):filtered.slice(0,shown)).map(d=>row(d,m)).join("");if(append)bars.insertAdjacentHTML("beforeend",html);else bars.innerHTML=html||"<p>該当企業はありません。</p>";result.textContent=`該当 ${filtered.length}社・延べ${filtered.reduce((a,d)=>a+Number(d.total||0),0)}人。現在 ${Math.min(shown,filtered.length)}社を表示。`;if(more)more.hidden=shown>=filtered.length;}
 apply.onclick=()=>{filterRows();render();query.blur();};reset.onclick=()=>{sector.value="all";focus.value="all";if(preset)preset.value="all";query.value="";filterRows();render();};query.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();apply.click();}};if(quick)quick.onclick=e=>{const b=e.target.closest("button[data-g],button[data-group]");if(!b||!preset)return;preset.value=b.dataset.g||b.dataset.group;filterRows();render();};if(more)more.onclick=()=>{const old=shown;shown=Math.min(shown+20,filtered.length);render(true,old);};filterRows();render();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>waitForData());else waitForData();
})();
