// Debug-assisted downstream completion; existing suites teleport between anchors
// and replenish resources. This verifies quest states, not human difficulty.
module.exports=async page=>{
 await require('../qa2/s2_story')(page);
 let d=await page.evaluate(()=>({state:__BR.G.state,ending:__BR.GP2.ending,errors:__BR.ERRS.n,missing:T.log.filter(s=>/^(NO|NOTOK)/.test(s))}));
 if(d.state!=='won'||d.ending!=='lift'||d.errors||d.missing.length)throw Error('QA FAIL downstream Level 2 '+JSON.stringify(d));
 console.log('QA PASS downstream Level 2 lift chain');
 await page.locator('#btnAgain').click();
 await page.waitForFunction(()=>document.body.classList.contains('lvl7')&&['intro','play'].includes(__BR.G.state),null,{timeout:240000});
 console.log('QA PASS Level 2 Continue reaches Level 7');
 await require('../qa7/s7_story')(page);
 d=await page.evaluate(()=>({state:__BR.G.state,ending:__BR.GS7.ending,errors:__BR.ERRS.n,missing:T.log.filter(s=>/^NO/.test(s))}));
 if(d.state!=='won'||d.ending!=='sail'||d.errors||d.missing.length)throw Error('QA FAIL downstream Level 7 '+JSON.stringify(d));
 console.log('QA PASS downstream Level 7 Sail ending');
};
