const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

const API_MAP = {
  WinGo_30S: "PASTE_30S_API",
  WinGo_1M: "PASTE_1M_API",
  WinGo_3M: "PASTE_3M_API",
  WinGo_5M: "PASTE_5M_API"
};

/* ---------------- LIVE DATA ---------------- */
app.get("/api/:game", async (req,res)=>{

    try{

        const url = API_MAP[req.params.game];

        const r = await fetch(url);
        const data = await r.json();

        res.json(data);

    }catch(e){
        res.json({error:"API FAIL"});
    }
});

/* ---------------- AI ENGINE ---------------- */
app.get("/ai/:game", async (req,res)=>{

    try{

        const url = API_MAP[req.params.game];
        const r = await fetch(url);
        const json = await r.json();

        const list = json?.data?.list || [];

        let big=0, small=0;
        let red=0, green=0;

        let streak = 1;
        let last = null;

        list.forEach(x=>{

            let n = parseInt(x.number);

            if(n>=5) big++; else small++;

            if(x.color.includes("red")) red++;
            if(x.color.includes("green")) green++;

            /* streak detect */
            if(last !== null && last == x.number){
                streak++;
            }
            last = x.number;
        });

        let risk =
            Math.abs(big-small)*10 +
            Math.abs(red-green)*5 +
            streak*3;

        if(risk>100) risk=100;

        let signal="WAIT";

        if(risk < 30) signal="🟢 SAFE / PLAY SMALL";
        else if(risk < 70) signal="🟡 CAUTION / WAIT";
        else signal="🔴 HIGH RISK / AVOID";

        let trend = big>small ? "📈 BIG ZONE" : "📉 SMALL ZONE";

        res.json({
            risk,
            signal,
            trend,
            streak
        });

    }catch(e){
        res.json({error:"AI FAIL"});
    }
});

app.listen(3000, ()=>{
    console.log("ULTRA AI OS RUNNING");
});