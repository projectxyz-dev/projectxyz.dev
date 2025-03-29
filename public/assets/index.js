/* project.xyz • 2024 */

document.addEventListener('mousemove', (event) => {
    const glow = document.getElementById('glow');
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
});

// Run JS after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    const header = document.getElementById("intro");
    let text = "project.xyz";

    header.innerHTML = ""; // Clear any existing text

// Iterate through each character in the text
    for (let i = 0; i < text.length; i++) {
        setTimeout(() => {
            header.innerHTML += text[i];
        }, i * 50);
    }
    setInterval(() => {
        if (header.innerHTML === "project.xyz_") {
            header.innerHTML = "project.xyz&nbsp;"; // Use non-breaking space to reserve space for the "_".
        } else {
            header.innerHTML = "project.xyz_";
        }
    }, 500);

});