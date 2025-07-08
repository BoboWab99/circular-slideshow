/* 
IMPROVE, CUSTOMIZE, USE AS YOU WISH!
*/

/**
 * Trigger a DOM reflow. Helps restart an element's animation.
 *
 * @param {HTMLElement} element
 * @return void
 *
 * @see https://www.harrytheo.com/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
 */
const reflow = element => {
    void element.offsetWidth;
}

/**
 * Convert a CSS time value to a valid Number (milliseconds)
 * @param {String} duration CSS time value e.g., 250ms or 0.5s
 * @returns {Number}
 */
const parseCSSDuration = duration => {
    if (duration.endsWith("ms")) {
        return parseFloat(duration);
    }
    if (duration.endsWith("s")) {
        return parseFloat(duration) * 1000;
    }
    return 0;
}

const __slider = () => document.querySelector(".slider");
const __slides = () => document.querySelectorAll(".slide");
const __currentSlide = () => document.querySelector(".slide.active");
const __indicatorsWrap = () => document.querySelector(".slider-indicators");

/**
 * Slide to given target
 * @param {Number} target Index of the target slide
 * @param {String?} direction Either of "next" and "prev"
 * @returns 
 */
const slideTo = (target, direction = null) => {
    if (direction && !(["prev", "next"].includes(direction))) return;

    const slides = __slides();
    const current = [...slides].indexOf(__currentSlide());

    if (target < 0 || target > slides.length - 1) return;
    if (target === current) return;

    if (!direction) {
        if (target > current) {
            direction = "next";
        } else {
            direction = "prev";
        }
    }

    const currentSlide = slides[current];
    const targetSlide = slides[target];
    const toNext = direction === "next";

    // Move next slide in the needed position before the animation
    targetSlide.classList.add(toNext ? "is-next" : "is-prev");
    reflow(targetSlide);

    // Start transition — Fire event here???
    targetSlide.classList.remove(toNext ? "is-next" : "is-prev");
    targetSlide.classList.add("active");
    currentSlide.classList.remove("active");
    currentSlide.classList.add(toNext ? "is-prev" : "is-next");

    // Highlight correct indicator
    if (__indicatorsWrap()) {
        const indicators = document.querySelectorAll(".slider-indicators>*");
        indicators[current].classList.remove("active");
        indicators[target].classList.add("active");
    }

    // After transition, clean up
    const timeout = parseCSSDuration(
        window.getComputedStyle(currentSlide).transitionDuration
    );
    setTimeout(() => {
        currentSlide.classList.remove(toNext ? "is-prev" : "is-next");
        // Fire event here???
    }, timeout);
}

const slideNext = () => {
    const slides = __slides();
    const current = [...slides].indexOf(__currentSlide());
    const target = (current + 1) % slides.length;
    slideTo(target, "next");
}

const slidePrev = () => {
    const slides = __slides();
    const current = [...slides].indexOf(__currentSlide());
    const target = (current - 1 + slides.length) % slides.length;
    slideTo(target, "prev");
}

const cycle = (interval = 3000, play = true) => {
    const slider = __slider();
    if (slider.hasAttribute("data-slider-cycle-id")) return;

    if (play) slideNext();
    const id = setInterval(() => slideNext(), interval); // number
    slider.setAttribute("data-slider-cycle-id", id);
    return id;
}

const pause = () => {
    const slider = __slider();
    const id = slider.getAttribute("data-slider-cycle-id");
    if (!id) return;

    clearInterval(id);
    slider.removeAttribute("data-slider-cycle-id");
}

const togglePlayPause = trigger => {
    const slider = __slider();
    if (slider.hasAttribute("data-slider-cycle-id")) {
        pause();
        trigger.classList.remove("active");
    } else {
        cycle();
        trigger.classList.add("active");
    }
}

document.querySelector(".next").setAttribute("onclick", "slideNext()");
document.querySelector(".prev").setAttribute("onclick", "slidePrev()");
document.querySelector(".cycle").setAttribute("onclick", "togglePlayPause(this)")

// Create indicators matching number of slides
const indicatorsWrap = __indicatorsWrap();
if (indicatorsWrap) {
    const slides = __slides();
    const current = [...slides].indexOf(__currentSlide());
    var innerHTML = ""; // indicatorsWrap's innerHTML
    slides.forEach((_, index) => {
        const cssClass = index == current ? "active" : "";
        innerHTML += `<button class="${cssClass}" onclick="slideTo(${index})"></button>`;
    });
    indicatorsWrap.innerHTML = innerHTML;
}