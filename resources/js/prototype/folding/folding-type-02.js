(function () {
    const wrapper = document.getElementById("fold-effect");
    const folds = Array.from(document.getElementsByClassName("fold"));
    const baseContent = document.getElementById("base-content");

    let state = {
        disposed: false,
        targetScroll: 0,
        scroll: 0
    };

    function lerp(current, target, speed = 0.1, limit = 0.001) {
        let change = (target - current) * speed;

        if (Math.abs(change) < limit) {
            change = target - current;
        }

        return change;
    }

    class FoldedDom {
        constructor(wrapper, folds = null) {
            this.wrapper = wrapper;
            this.folds = folds;
            this.scrollers = [];
        }

        setContent(baseContent, createScrollers = true) {
            const folds = this.folds;
            if (!folds) return;

            let scrollers = [];

            for (let i = 0; i < folds.length; i++) {
                const fold = folds[i];
                const copyContent = baseContent.cloneNode(true);
                copyContent.id = "";

                let scroller;

                if (createScrollers) {
                    let sizeFixEle = document.createElement("div");
                    sizeFixEle.classList.add("fold-size-fix");

                    scroller = document.createElement("div");
                    scroller.classList.add("fold-scroller");

                    sizeFixEle.append(scroller);
                    fold.append(sizeFixEle);
                } else {
                    scroller = this.scrollers[i];
                }
                scroller.append(copyContent);
                scrollers[i] = scroller;
            }
            this.scrollers = scrollers;
        }

        updateStyles(scroll) {
            const folds = this.folds;
            const scrollers = this.scrollers;

            for (let i = 0; i < folds.length; i++) {
                const scroller = scrollers[i];

                if (scroller && scroller.children.length > 0) {
                    scroller.children[0].style.transform = `translateX(${scroll}px)`;
                }
            }
        }
    }

    let insideFold = new FoldedDom(wrapper, folds);
    insideFold.setContent(baseContent);

    const mainFold = folds[folds.length - 1];

    let tick = () => {
        if (state.disposed) return;

        state.targetScroll = -(
            document.documentElement.scrollLeft || document.body.scrollLeft
        );

        state.targetScroll = Math.max(
            Math.min(0, state.targetScroll),
            -insideFold.scrollers[0].children[0].clientWidth + mainFold.clientWidth
        );

        state.scroll += lerp(state.scroll, state.targetScroll, 0.1, 0.0001);

        insideFold.updateStyles(state.scroll);

        requestAnimationFrame(tick);
    };

    let lastClientX = null;
    let isDown = false;

    let onDown = ev => {
        console.log(
            Math.max(
                state.targetScroll,
                -insideFold.scrollers[0].children[0].clientWidth + mainFold.clientWidth
            )
        );

        console.log(
            "s",
            -insideFold.scrollers[0].children[0].clientWidth + mainFold.clientWidth
        );

        isDown = true;
    }

    let onUp = ev => {
        isDown = false;
    }

    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseout", ev => {
        var from = ev.relatedTarget || ev.toElement;

        if (!from || from.nodeName == "HTML") {
            isDown = false;
        }
    });

    window.addEventListener("touchstart", onDown);
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchcancel", onUp);

    window.addEventListener("mousemove", ev => {
        if (lastClientX && isDown) {
            state.targetScroll += ev.clientX - lastClientX;
        }

        lastClientX = ev.clientX;
        // console.log(lastClientX);
    });

    window.addEventListener("touchmove", ev => {
        let touch = ev.touches[0];

        if (lastClientX && isDown) {
            state.targetScroll += ev.clientX - lastClientX;
        }

        lastClientX = ev.clientX;
    });

    window.addEventListener("wheel", ev => {
        state.targetScroll += -Math.sign(ev.deltaY) * 30;
    });

    insideFold = new FoldedDom(wrapper, folds);
    insideFold.setContent(baseContent);

    tick();
})();