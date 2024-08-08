/* project.xyz • 2024 */

document.addEventListener('mousemove', (event) => {
    const glow = document.getElementById('glow');
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
});
