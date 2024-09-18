// ==UserScript==
// @name         JustPRO DEMO OPTIMIZED
// @namespace    none
// @version      2.2
// @description  Developing...
// @author       C1PRI
// @match        *://www.google.com
// @require      https://github.com/CipRos/JustPro/raw/main/testmanager.js
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://unpkg.com/xhook@latest/dist/xhook.min.js
// @require      https://cdn.jsdelivr.net/npm/tweakpane@3.1.4/dist/tweakpane.min.js
// @require      https://rawgit.com/notifyjs/notifyjs/master/dist/notify.js
// @require      https://unpkg.com/@tweenjs/tween.js@^23.1.3/dist/tween.umd.js
// @require      https://raw.githubusercontent.com/sgsvnk/GM_SuperValue/master/GM_SuperValue.js
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

(async function () {
    'use strict';

    if (window.top !== window.self) return;

    // init saved settings
    const defaultSettings = {
        show: true,
        width: "350px",
        heigth: "108px",
        firstrun: true,
        "Resizeable": false,
        "Page Background Color": "#00000000",
        logourl: "",
        bgurl: "",
        "Bypass Console": false,
        "Anti Screenshot": true,
        "Developer Settings": false,
        "ratioCount": 1
    };

    try {
// init per-session settings
        var firstlog = true;
        var templog = { logs: "" };
        var temptime = { clock: "" };
        var focused = true;

                let settings = JSON.parse(localStorage.getItem("justpro")) || defaultSettings;
        if (!localStorage.getItem("justpro")) {
            settings.firstrun = true;
            localStorage.setItem("justpro", JSON.stringify(settings));
        } else {
            settings.firstrun = false;
        }
                // Hook console.log for protection
        var oldlog = console.log
        console.log = function (...args) {
            var tempstring = "";
            for (var i = 0; i < args.length; i++) {
                tempstring += args[i]
            }
            log(tempstring)
            if (settings["Bypass Console"] == false) oldlog(...args)
        }
        
        const runningUnderSM = ('undefined' !== typeof JPTestManager);
        console.log(`Running in a script manager? ${runningUnderSM}`);
        if(!runningUnderSM){
            var oldfetch = fetch
            fetch = function(url){
                return oldfetch("https://api.allorigins.win/get?url="+ encodeURIComponent(url))
            }
            await fetch("https://code.jquery.com/jquery-3.7.1.min.js").then(r=>r.json()).then(d=>window.eval(d.contents))
            await fetch("https://rawgit.com/notifyjs/notifyjs/master/dist/notify.js").then(r=>r.json()).then(d=>window.eval(d.contents))
            $.notify("[JP] Loading resources...", { position: "bottom left", className: "info", gap: 10, autoHideDelay: 2000})
            var links = [//fetch("https://code.jquery.com/jquery-3.7.1.min.js"),
                         fetch("https://unpkg.com/xhook@latest/dist/xhook.min.js"),
                         fetch("https://cdn.jsdelivr.net/npm/tweakpane@3.1.4/dist/tweakpane.min.js"),
                         //fetch("https://rawgit.com/notifyjs/notifyjs/master/dist/notify.js"),
                         fetch("https://unpkg.com/@tweenjs/tween.js@23.1.3/dist/tween.umd.js"),
                         fetch("https://raw.githubusercontent.com/sgsvnk/GM_SuperValue/master/GM_SuperValue.js")]

            const res = await Promise.all(links);
            const data = await Promise.all(res.map((item) => {
                return item.json();
            }))

            //linksLoaded = true;
            //console.log(data[3].contents)

            for(var il=0; il<data.length; il++){
                window.eval(data[il].contents)
            }
            console.log("Links loaded.");
        }

        // 1. LOAD SETTINGS
        for (const [key, value] of Object.entries(defaultSettings)) {
            if (settings[key] !== undefined) continue;
            log("fixing setting \"" + key + "\"")
            settings[key] = value;
        }

        // moved it here because yes
        if (settings["firstrun"]) {
            // set up stuff if needed
            notify.info("This looks like the first time you use JustPro! Welcome!!!")
        }

        class TestError extends Error {
            constructor(message, type) {
                super(message); // (1)
                this.name = "TestError"; // (2)
                this.type = type
            }
        }

        // 2. HOOKS
        console.log("[JP] Hooking network...")
        xhook.before(function (request, response) {
            if (request.url == ("https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png")) {
                response.text = response.text.replace(settings.logourl);
            }
        });

        while (!document.querySelector("body > div.L3eUgb > div.o3j99.LLD4me.yr19Zb.LS8OJ > div > img")) {
            await sleep(10);
        }

        var visible = settings.show

        // 3. LOAD CHANGES FROM SETTINGS

        // set top bar image bg
        if (settings.bgurl.trim().length !== 0 && isValidHttpUrl(settings.bgurl)) {
            const bgElement = document.querySelector(".L3eUgb");
            Object.assign(bgElement.style, {
                background: `url(${settings.bgurl})`,
                backgroundSize: "cover",                      /* <------ */
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center"
            });
        }

        // set logo image url
        if (settings.logourl.trim().length !== 0 && isValidHttpUrl(settings.logourl)) {
            const logoImg = document.querySelector("body > div.L3eUgb > div.o3j99.LLD4me.yr19Zb.LS8OJ > div > img");
            Object.assign(logoImg, {
                src: settings.logourl,
                srcset: `${settings.logourl} 1x, ${settings.logourl} 2x`,
                style: { maxHeight: "120%", height: "152px" }
            });
        }

        document.querySelectorAll(".L3eUgb")[0].style.backgroundColor = settings["Page Background Color"]

        // 4. BUILD UI

        // build UI base for dragging
        const base = document.createElement("div");
        var tempgen = "a" + generateRandomString(10);
        base.id = tempgen;
        Object.assign(base.style, {
            //background: "red",
            resize: (settings["Resizeable"] ? "both" : "none"),
            overflow: (settings["Resizeable"] ? "hidden" : "show"),
            transform: 'translate(-1200px, 200px)',
            width: settings["width"], //|| defaultSettings["width"],
            height: settings["height"],
            position: "absolute",
            zIndex: "99999999999999999",
            display: settings.show ? "block" : "none"
        });
        if (!visible) fade(base);

        requestAnimationFrame(animate);

        console.log("[JP] Initializing menu...")
        // init tweakpane
        //fetch("https://cdn.jsdelivr.net/npm/tweakpane@3.1.4/dist/tweakpane.min.js").then(r => r.text()).then(r => eval(r))
        await waitFor("Tweakpane");
        var pane = new Tweakpane.Pane({
            container: base
        });

        console.log("[JP] Initializing console...")
        // hide label and make console bigger
        waitForElm(`#${tempgen} > div > div.tp-brkv.tp-rotv_c > div.tp-tabv.tp-cntv.tp-v-lst.tp-v-vlst > div.tp-brkv.tp-tabv_c.tp-v-lst.tp-v-vlst > div:nth-child(4) > div.tp-lblv.tp-v-fst > div.tp-lblv_l`).then((elem) => {
            elem.style.display = "none"
        });
        waitForElm(`#${tempgen} > div > div > div.tp-tabv.tp-cntv.tp-v-lst.tp-v-vlst > div.tp-brkv.tp-tabv_c.tp-v-lst.tp-v-vlst > div:nth-child(4) > div > div.tp-lblv_v`).then((elem) => {
            elem.style.width = "100%"
        });

        waitForElm(`#${tempgen} > div > div.tp-brkv.tp-rotv_c > div.tp-tabv.tp-cntv.tp-v-lst.tp-v-vlst > div.tp-tabv_i`).then((elem) => {
            elem.remove()
        })

        // hide/show console tab based on settings
        waitForElm(`#${tempgen} > div > div.tp-brkv.tp-rotv_c > div.tp-tabv.tp-cntv.tp-v-lst.tp-v-vlst > div.tp-tabv_t > div:nth-child(4)`).then((elem) => {
            elem.style.display = (settings["Bypass Console"] ? "block" : "none")
        })

        waitForElm(`#${tempgen} > div > div.tp-brkv.tp-rotv_c > div.tp-tabv.tp-cntv.tp-v-lst.tp-v-vlst > div.tp-tabv_t > div:nth-child(5)`).then((elem) => {
            elem.style.display = (settings["Developer Settings"] ? "block" : "none")
        })

        // first half of the draggable code
        for (var x = 1; x <= 10; x++) {
            var sep = pane.addSeparator();
            var ele = sep.controller_.view.element
            ele.id = `sep${x}`
        }

        //init tabs
        var tab = pane.addTab({
            pages: [
                { title: 'Info' },
                { title: "Misc" },
                { title: "UI" },
                { title: "Console" },
                { title: "Developer" }
            ],
        });

        tab.pages[0].addMonitor(temptime, 'clock', {
            interval: 1000,
        });

        console.log("[JP] Building menu...")

        // Show each ratio level requirements
        var rat = tab.pages[0].addFolder({ title: "Ratios / Download Unused", expanded: false })
        for (var g = 1; g <= settings["ratioCount"]; g++) {
            const temp = {};
            const ratioKey = `To keep ratio ${g}`;
            temp[ratioKey] = "1"; // Replace with the actual calculation if needed
            rat.addMonitor(temp, ratioKey);
        }

        tab.pages[1].addInput(settings, "Bypass Console").on("change", (ev) => {
            const consoleTab = document.querySelector("#" + tempgen + " > div > div.tp-brkv.tp-rotv_c > div.tp-tabv.tp-cntv.tp-v-lst.tp-v-vlst > div.tp-tabv_t > div:nth-child(4)");
            const action = ev.value ? "block" : "none"; // Simplify conditional assignment
            consoleTab.style.display = action; // Use cached DOM element
        });
        tab.pages[1].addInput(settings, "Developer Settings").on("change", (ev) => {
            const devTab = document.querySelector("#" + tempgen + " > div > div.tp-brkv.tp-rotv_c > div.tp-tabv.tp-cntv.tp-v-lst.tp-v-vlst > div.tp-tabv_t > div:nth-child(5)");
            const action = ev.value ? "block" : "none"; // Simplify conditional assignment
            devTab.style.display = action; // Use cached DOM element
        });
        tab.pages[1].addInput(settings, "Anti Screenshot");
        tab.pages[1].addInput(settings, "Resizeable").on("change", (ev) => {
            base.style.resize = (ev.value ? "both" : "none")
        });

        var ratioSettings = tab.pages[2].addFolder({ title: "Ratio Settings", expanded: false })
        ratioSettings.addInput(settings, 'ratioCount', { // how many ratio levels to show on main tab
            step: 1,
            min: 1
        });

        for (var y = 0; y < 10; y++) {
            tab.pages[2].addSeparator();
        }

        const imageSettings = tab.pages[2];//.addFolder({ title: "Page Settings", expanded: false });
        const logoSelector = "body > div.L3eUgb > div.o3j99.LLD4me.yr19Zb.LS8OJ > div > img";
        imageSettings.addButton({ title: "Change Google Logo" }).on('click', () => {
            const url = prompt("LOGO URL", settings.logourl).trim();
            if (url.length > 0 && isValidHttpUrl(url)) {
                const img = document.querySelector(logoSelector);
                img.src = url;
                img.srcset = `${url} 1x, ${url} 2x`;
                img.style.maxHeight = "120%";
                img.style.height = "152px";
                settings.logourl = url;
            } else {
                settings.logourl = "";
            }
        });


        const backgroundSelector = ".L3eUgb";
        imageSettings.addButton({ title: "Change Background Image" }).on('click', () => {
            const url = prompt("BG URL", settings.bgurl).trim();
            if (url.length > 0 && isValidHttpUrl(url)) {
                const element = document.querySelector(backgroundSelector);
                if (element) {
                    element.style.background = `url(${url.replace(/(\r\n|\n|\r)/gm, "")}) no-repeat`;
                    element.style.backgroundSize = "cover";
                }
                settings.bgurl = url.replace(/(\r\n|\n|\r)/gm, "");
            } else {
                settings.bgurl = "";
            }
        });

        imageSettings.addInput(settings, "Page Background Color", {
            picker: 'inline',
            expanded: false
        })

        for (var xy = 0; xy < 2; xy++) {
            tab.pages[2].addSeparator();
        }

        // custom console
        tab.pages[3].addMonitor(templog, 'logs', {
            multiline: true,
            lineCount: 5,
        });
        tab.pages[3].addButton({ title: "Clear Logs" }).on('click', () => {
            firstlog = true
            templog.logs = ""
        });

        tab.pages[4].addButton({ title: "Trigger Error" }).on('click', () => {
            throw new Error("testerror")
        });

        tab.pages[4].addButton({ title: "Trigger nomatchingcontroller error" }).on('click', () => {
            //throw new TestError({message: "No matching controller for 'testvar'", type: "nomatchingcontroller"})
            nmc({message: "No matching controller for 'testvar'", type: "nomatchingcontroller"}, true)
        });

        console.log("[JP] Hooking keys...")
        document.body.addEventListener("keyup", async function (e) {
            // Hide / Show
            if (e.code == "Insert") {
                if (visible) {
                    fade(base);
                    visible = false
                } else {
                    unfade(base);
                    visible = true
                }
            }

            // Print Screen Bypass
            if (e.code == "PrintScreen") {
                if (settings["Anti Screenshot"] == true) {
                    focused = false;
                    fade(base);
                    visible = false

                    var copyofsettings = settings
                    baseSettings["show"] = false;
                    settings = baseSettings;

                    await waitForFocus();
                    await sleep(200);

                    settings = copyofsettings
                    //document.querySelector("#wrapper > div.mainheader").style.background = "url("+settings.bgurl+")"
                    unfade(base);
                    visible = true
                    console.log("Screenshot Bypassed!")
                }
            }
        });
        $(window).focus(function () {
            focused = true
        });

        // Load the starting UI
        console.log("[JP] Starting animation...")
        document.body.prepend(base);
        var coords = { x: -600, y: 400 }; // Start at (0, 0)
        new TWEEN.Tween(coords) // Create a new tween that modifies 'coords'.
            .to({ x: 80, y: 400 }, 1300) // Move to (300, 200) in 1 second.
            .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
            .onUpdate(function () { // Called after tween.js updates 'coords'.
            // Move 'box' to the position described by 'coords' with a CSS translation.
            base.style.setProperty('transform', 'translate(' + coords.x + 'px, ' + coords.y + 'px)');
        })
            .start(); // Start the tween immediately.

        var topbar = document.createElement("div")
        topbar.id = "jptb"
        topbar.style = "cursor: move;"
        document.getElementById("sep1").parentNode.prepend(topbar);
        for (var xx = 1; xx <= 10; xx++) {
            topbar.appendChild(document.getElementById("sep" + xx))
            //console.log(xx)
        }
        dragElement(topbar)

        // fast running functions
        console.log("[JP] Starting loop...")
        setInterval(function () {
            var today = new Date();
            temptime["clock"] = today.toLocaleTimeString();

            settings.show = visible
            if (document.querySelector("#" + tempgen + " > div")) {
                settings.width = document.querySelector("#" + tempgen).style.width
                settings.height = document.querySelector("#" + tempgen).style.height
            }

            document.querySelectorAll(".L3eUgb")[0].style.backgroundColor = settings["Page Background Color"]
            document.querySelector("#" + tempgen + " > div").style.height = document.querySelector("#" + tempgen).style.height
            if (document.querySelector("#" + tempgen + " > div > div.tp-brkv.tp-rotv_c > div.tp-tabv.tp-cntv.tp-v-lst.tp-v-vlst > div.tp-brkv.tp-tabv_c.tp-v-lst.tp-v-vlst > div.tp-brkv.tp-v-fst.tp-v-lst.tp-v-vlst > div.tp-lblv.tp-v-fst > div.tp-lblv_v > div > textarea")) document.querySelector("#" + tempgen + " > div > div.tp-brkv.tp-rotv_c > div.tp-tabv.tp-cntv.tp-v-lst.tp-v-vlst > div.tp-brkv.tp-tabv_c.tp-v-lst.tp-v-vlst > div.tp-brkv.tp-v-fst.tp-v-lst.tp-v-vlst > div.tp-lblv.tp-v-fst > div.tp-lblv_v > div > textarea").style.height = Number(document.querySelector("#" + tempgen + " > div").style.height.slice(0, -2)) - 88 + "px"

            // save any changes
            localStorage.setItem("justpro", JSON.stringify(settings));
        }, 50);


        // insert watermark
        $.notify("[JP] Succesfully Loaded!", { position: "bottom left", className: "success", gap: 10, autoHideDelay: 2000})

        // GGWP
        console.log("[JP] Succesfully Loaded!")

        log(`Text only visible in the JP console, ignoring settings`)

        // animate(time)
        // generateRandomString(length)
        // log(message)
        // waitForFocus()
        // addHours(numOfHours, date = new Date())
        // isValidHttpUrl(string)
        // sleep(ms)
        // waitForElm(selector)
        // fade(element)
        // unfade(element)
        // dragElement(element)
        function animate(n) { requestAnimationFrame(animate); TWEEN.update(n); }; function generateRandomString(n) { let r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", t = "", e = r.length; for (let o = 0; o < n; o++)t += r.charAt(Math.floor(Math.random() * e)); return t }; function log(e) { let t = new Date().toLocaleTimeString().slice(0, -3); templog.logs += firstlog ? `[${t}] ${e}` : `\n[${t}] ${e}`, firstlog = !1 } function waitForFocus() { return new Promise(e => { let t = () => { focused ? e() : setTimeout(t, 10) }; t() }) } function addHours(e, t = new Date) { return t.setTime(t.getTime() + 36e5 * e), t } function isValidHttpUrl(e) { let t; try { t = new URL(e) } catch (n) { return !1 } return "http:" === t.protocol || "https:" === t.protocol || "blob:" === t.protocol || "base64:" === t.protocol } function sleep(e) { return new Promise(t => setTimeout(t, e)) } async function waitFor(e, t = 50) { for (; !window.hasOwnProperty(e);)await new Promise(e => setTimeout(e, t)) } function waitForElm(e) { return new Promise(t => { if (document.querySelector(e)) return t(document.querySelector(e)); let n = new MutationObserver(o => { document.querySelector(e) && (t(document.querySelector(e)), n.disconnect()) }); n.observe(document.body, { childList: !0, subtree: !0 }) }) } function fade(e) { var t = 1, n = setInterval(function () { t <= .1 && (clearInterval(n), e.style.display = "none"), e.style.opacity = t, e.style.filter = "alpha(opacity=" + 100 * t + ")", t -= .25 * t }, 10) } function unfade(e) { var t = .1; e.style.display = "block"; var n = setInterval(function () { t >= 1 && clearInterval(n), e.style.opacity = t, e.style.filter = "alpha(opacity=" + 100 * t + ")", t += .15 * t }, 10) } function dragElement(e) { var t = 0, n = 0, o = 0, l = 0; function r(e) { (e = e || window.event).preventDefault(), t = o - e.clientX, n = l - e.clientY, o = e.clientX, l = e.clientY, base.style.top = base.offsetTop - n + "px", base.style.left = base.offsetLeft - t + "px" } function i() { document.onmouseup = null, document.onmousemove = null } e.onmousedown = function e(t) { (t = t || window.event).preventDefault(), o = t.clientX, l = t.clientY, document.onmouseup = i, document.onmousemove = r } }

    } catch (e) {
        console.error(e)
        if (e.type == "nomatchingcontroller") {
            nmc(e);
        }
    }

    async function waitFor(val, inte = 50) {
        while(!window.hasOwnProperty(val)){
            await new Promise(resolve => setTimeout(resolve, inte));
        }
    };

    function nmc(e, testing=false){
        $.notify("[JP] Fatal error! Click to see details.", { position: "bottom left", className: "error", gap: 10, clickToHide: false, autoHide: false })
        $(".notifyjs-wrapper").on('click', function () {
            $(".notifyjs-wrapper").prop("onclick", null);
            $(this).trigger('notify-hide');
            if (confirm("JustPro failed! \nError: " + e.message + "\n\nJustPro will try to fix this error, proceed?")) {
                //fix settings
                var tofix = e.message.slice(28, -1)
                var savedSettings = JSON.parse(localStorage.getItem("justpro"))
                if(!testing){
                    savedSettings[tofix] = defaultSettings[tofix]
                    localStorage.setItem("justpro", JSON.stringify(savedSettings));
                }

                //test it
                var tempSavedSettings = JSON.parse(localStorage.getItem("justpro"))
                if (testing ? true : (tempSavedSettings[tofix] !== undefined)) {
                    $.notify("[JP] Error successfully saved! Refresh page to update.", { position: "bottom left", className: "success", gap: 10 })
                } else {
                    $.notify("[JP] Could not fix error! Check Dev Console.", { position: "bottom left", className: "error", gap: 10, clickToHide: false, autoHide: false })
                }
            }
        });
        return;
    }
})();


