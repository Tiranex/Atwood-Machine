const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');
let min = null;

/*COLORS */
const background_color = "#333";
const axis_color = "white";
const bar_color = ["gray", "gray", "gray", "gray"];
const circle_color = ["red", "blue", "green", "purple"];
const circle_trajectory_color=["lightcoral", "lightblue", "lightgreen", "#CBC3E3"]
const circle_radius = 20;

let trajectory1 = [[]];
let trajectory2 = [[]];
let draw_trajectory1 = true;
let draw_trajectory2 = true;
const max_trajectory_length = 100;
let n_pendulums = 1;

let end = false;

let pos = [[[Math.random() * 3.5 - 1.75, Math.random() * 3.5 - 1.75], [Math.random() * 3.5 - 1.75, Math.random() * 3.5 - 1.75]]]

function draw_axis(){
    context.fillStyle = background_color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = axis_color;
    context.lineWidth =  1.5;

    // Draw x-axis
    context.beginPath();
    context.moveTo(0, canvas.height-10);
    context.lineTo(canvas.width, canvas.height-10);
    context.stroke();
    context.closePath();

    // Draw y-axis
    context.beginPath();
    context.moveTo(10, 0);
    context.lineTo(10, canvas.height);
    context.stroke();
    context.closePath();

}
function draw_axis_labels(){
    // Draw axis labels
    context.font = "15px Montserrat";
    context.fillStyle = "white";
    for(let i = -1.5; i < 2; i += 0.5) {
        context.fillText(i, 20, canvas.height/2 + i*min/4 + 5);
        
    }
    for(let i = -1.5; i < 2; i += 0.5) {
        context.fillText(i, canvas.width/2 + i*min/4, canvas.height - 20);
    }
}
function draw_variables() {
    context.font = "15px Montserrat";
    context.fillStyle = "white";
    context.fillText(`Péndulo: ${selected_pendulum+1}`, canvas.width - 100, 30);
    context.fillText(`θ1: ${(y[selected_pendulum][0]*180 / Math.PI).toFixed(2)}`, canvas.width - 100, 50);
    context.fillText(`θ2: ${(y[selected_pendulum][1]*180 / Math.PI).toFixed(2)}`, canvas.width - 100, 70);
    context.fillText(`ω1: ${(y[selected_pendulum][2]*180 / Math.PI).toFixed(2)}`, canvas.width - 100, 90);
    context.fillText(`ω2: ${(y[selected_pendulum][3]*180 / Math.PI).toFixed(2)}`, canvas.width - 100, 110);
}

function draw_elements(i){
    
    // Trajectory
    if(draw_trajectory1) {
        for(let j = 0; j<trajectory1[i].length; j++){
            context.fillStyle = circle_trajectory_color[i];
            context.beginPath();
            context.arc(...cartesian_to_canvas(trajectory1[i][j][0], trajectory1[i][j][1]), 5, 0, 2*Math.PI);
            context.fill();
            context.closePath();
        }
    }
    
    if(draw_trajectory2) {
        for(let j = 0; j<trajectory2[i].length; j++){
            context.fillStyle = circle_trajectory_color[i];
            context.beginPath();
            context.arc(...cartesian_to_canvas(trajectory2[i][j][0], trajectory2[i][j][1]), 5, 0, 2*Math.PI);
            context.fill();
            context.closePath();
        }
    }
    
    // Lines
    context.strokeStyle = bar_color[i];
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(canvas.width/2, canvas.height/2);
    context.lineTo(...cartesian_to_canvas(pos[i][0][0], pos[i][0][1]));
    context.stroke();
    context.closePath();

    context.beginPath();
    context.moveTo(...cartesian_to_canvas(pos[i][0][0], pos[i][0][1]));
    context.lineTo(...cartesian_to_canvas(pos[i][1][0], pos[i][1][1]));
    context.stroke();
    context.closePath();

    // Circles
    context.fillStyle = circle_color[i];
    context.beginPath();
    context.arc(...cartesian_to_canvas(pos[i][0][0], pos[i][0][1]), circle_radius, 0, 2*Math.PI);
    context.fill();
    context.closePath();

    context.beginPath();
    context.arc(...cartesian_to_canvas(pos[i][1][0], pos[i][1][1]), circle_radius, 0, 2*Math.PI);
    context.fill();
    context.closePath();

    
    
}
function draw(){
    draw_axis();
    draw_axis_labels();
    //draw_variables();
    //update();
    
    //for(let i =0; i<y.length; i++)
    //    draw_elements(i);
}

function update(){
    if(end)
        return;
    solve();
}

function solve(){
    for(let i =0; i<y.length; i++){
        y[i] = runge_Kutta(0, y[i], f, time_step, i)
        pos[i][0] = [l1[i]*Math.sin(y[i][0]), -l1[i]*Math.cos(y[i][0])]
        pos[i][1] = [l2[i]*Math.sin(y[i][1]) + pos[i][0][0], -l2[i]*Math.cos(y[i][1]) + pos[i][0][1]]
        
        trajectory1[i].push(pos[i][0]);
        trajectory2[i].push(pos[i][1]);

        if(trajectory1[i].length > max_trajectory_length)
            trajectory1[i].shift();
        if(trajectory2[i].length > max_trajectory_length)
            trajectory2[i].shift();
    }
}



/* Retocar para obtener el width de control */
const control = document.getElementById("controls");
function resize(){
    min = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = min
    canvas.height = min
    if(window.innerWidth - min < control.clientWidth+70)
        canvas.width = window.innerWidth
    if(canvas.width > document.documentElement.clientWidth)
        canvas.width = document.documentElement.clientWidth;
    draw();
}

function cartesian_to_canvas(x, y){
    return [canvas.width/2 + x*min/4, canvas.height/2 - y*min/4];
}

window.onresize = resize;


/* Connect Elements to inputs */
let m1 = [2];
let m2 = [2];
let l1 = [1];
let l2 = [1];
let g = 9.81;
const time_step = 0.01;
let theta1 = [2*Math.PI*(2/3)];
let theta2 = [2*Math.PI*(10/360)];
let w_1 = [0];
let w_2 = [0];
let y = [[theta1[0], theta2[0], w_1[0], w_2[0]]]
/* Solver */
function f(yprime, y, i, t){
    // We copy the values know from state into yprime
    yprime[0] = y[2]
    yprime[1] = y[3]

    let num = -g*(2*m1[i] + m2[i])*Math.sin(y[0]) - m2[i]*g*Math.sin(y[0] - 2*y[1]) - 2*Math.sin(y[0] - y[1])*m2[i]*(y[3]**2*l2[i] + y[2]**2*l1[i]*Math.cos(y[0] - y[1]))
    let den = l1[i]*(2*m1[i] + m2[i] - m2[i]*Math.cos(2*y[0] - 2*y[1]))
 
    yprime[2] = num/den

    num = 2*Math.sin(y[0] - y[1])*(y[2]**2*l1[i]*(m1[i] + m2[i]) + g*(m1[i] + m2[i])*Math.cos(y[0]) + y[3]**2*l2[i]*m2[i]*Math.cos(y[0] - y[1]))
    den = l2[i]*(2*m1[i] + m2[i] - m2[i]*Math.cos(2*y[0] - 2*y[1]))

    yprime[3] = num/den
    
    return yprime 
}

/**
 * Performs the Runge-Kutta method to solve differential equations.
 * @param {number} t - The current time.
 * @param {number[]} y - The state vector.
 * @param {function} f - The function that calculates the derivative of the state vector.
 * @param {number} delta_t - The time step size.
 * @returns {number[]} The updated state vector.
 */
function runge_Kutta(t, y, f, delta_t, i){
    
    let k1 = Array(4).fill(0);
    let k2 = Array(4).fill(0);
    let k3 = Array(4).fill(0);
    let k4 = Array(4).fill(0);
    // K1 = h*f(t, y)
    f(k1, y, i)
    k1 = const_multiplication(delta_t, k1)
    // K2 = h*f(t + delta_t/2, y + delta_t/2*k1)
    f(k2, vector_sum(y, const_multiplication(1/2, k1)),i)
    
    k2 = const_multiplication(delta_t, k2)
    // K3 = h*f(t + delta_t/2, y + delta_t/2*k2)
    f(k3, vector_sum(y, const_multiplication(1/2, k2)),i)
    k3 = const_multiplication(delta_t, k3)
    // K4 = h*f(t + delta_t, (p1, p2, p3) + delta_t*k3)
    f(k4, vector_sum(y, k3), i)
    k4 = const_multiplication(delta_t, k4)
    
    // v(t + delta_t) = v(t) + delta_t/6*(k1 + 2*k2 + 2*k3 + k4)
    return vector_sum(y, const_multiplication(1/6, vector_sum(k1, vector_sum(const_multiplication(2, k2), vector_sum(const_multiplication(2, k3), k4)))))
}

/* Auxiliary Functions /*

/**
 * Calculates the sum of two vectors.
 * @param {number[]} p1 - The first vector.
 * @param {number[]} p2 - The second vector.
 * @returns {number[]} The sum of the two vectors.
 */
function vector_sum(p1, p2){
    
    let vec = p1.slice()
    for(let i=0; i< p2.length; i++){
        vec[i] += p2[i]
    }
    return vec
}

/**
 * Multiplies each element of an array by a constant value.
 * @param {number} c - The constant value to multiply each element by.
 * @param {number[]} p - The array of numbers to be multiplied.
 * @returns {number[]} - The resulting array with each element multiplied by the constant value.
 */
function const_multiplication(c, p){
    let vec = p.slice()
    for(let i=0; i<p.length; i++){
        vec[i] *= c
    }
    
    return vec
}

/* Start Reset */
function reset(){
    end = false;
    for(let i =0; i<y.length; i++){
        y[i] = [theta1[i], theta2[i], w_1[i], w_2[i]]
        trajectory1[i] = [];
        trajectory2[i] = [];
    }
}

function play_pause(){
    if(end){
        end = false;
        play_button.innerHTML = '<path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>'
    } else{
        end = true;
        play_button.innerHTML = '<path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>'
    }
}

const play_button = document.getElementById("play")
play_button.onclick = play_pause;

document.getElementById("reset").onclick = reset;

let interval = null;
document.getElementById("skip").addEventListener("mousedown", function(){
    if(end==false)
        play_pause();
        
    interval = setInterval(solve, time_step*4000);
});

document.getElementById("skip").addEventListener("mouseup", function(){
    clearInterval(interval);
});

/* Handle Multiple Pendulums */
let selected_pendulum = 0;
const pendulum_selector = document.getElementById("select_pendulum");

pendulum_selector.onchange = function(){
    const options = document.querySelectorAll("#select_pendulum option");
    options[selected_pendulum].classList.remove("active");
    selected_pendulum = parseInt(this.value);
    options[selected_pendulum].classList.add("active");
    load_settings();
}


function add_pendulum(){
    if(n_pendulums == 4)
        return;
    n_pendulums++;
    y.push([0,0,0,0])
    pos.push([[0,-1],[0,-2]])
    m1.push(2.);
    m2.push(2.);
    l1.push(1.);
    l2.push(1.);
    theta1.push(0.);
    theta2.push(0.);
    w_1.push(0.);
    w_2.push(0.);

    trajectory1.push([])
    trajectory2.push([])
    
    const options = document.querySelectorAll("#select_pendulum option");
    options[selected_pendulum].classList.remove("active");
    pendulum_selector.innerHTML += `<option value="${n_pendulums-1}" class="active">Pendulum ${n_pendulums}</option>`;
    selected_pendulum = n_pendulums-1;
    load_settings();
    draw();
}

function delete_pendulum(){
    if(n_pendulums == 1)
        return;
    n_pendulums--;

    y.splice(selected_pendulum, 1);
    pos.splice(selected_pendulum, 1);
    m1.splice(selected_pendulum, 1);
    m2.splice(selected_pendulum, 1);
    l1.splice(selected_pendulum, 1);
    l2.splice(selected_pendulum, 1);
    theta1.splice(selected_pendulum, 1);
    theta2.splice(selected_pendulum, 1);
    w_1.splice(selected_pendulum, 1);
    w_2.splice(selected_pendulum, 1);
    trajectory1.splice(selected_pendulum, 1);
    trajectory2.splice(selected_pendulum, 1);
    if(selected_pendulum == n_pendulums)
        selected_pendulum--;    
    const options = document.querySelectorAll("#select_pendulum option");
    pendulum_selector.removeChild(options[selected_pendulum]);
    options[selected_pendulum].classList.add("active");
    update_value();
    load_settings();
    draw();
}

function update_value(){
    const options = document.querySelectorAll("#select_pendulum option")
    for(let i=0; i<options.length; i++){
        options[i].value = i;
        options[i].textContent = `Pendulum ${i+1}`;
    }
}

function load_settings(){
    const i = selected_pendulum
    document.getElementById("m1_number").value = m1[i].toFixed(2);
    document.getElementById("m2_number").value = m2[i].toFixed(2);
    document.getElementById("l1_number" ).value = l1[i].toFixed(2);
    document.getElementById("l2_number" ).value = l2[i].toFixed(2);
    document.getElementById("g_number" ).value = g.toFixed(2);
    document.getElementById("a1_number" ).value = (theta1[i] * 180 / Math.PI).toFixed(2);
    document.getElementById("a2_number").value = (theta2[i] * 180 / Math.PI).toFixed(2);
    document.getElementById("v1_number").value = w_1[i].toFixed(2);
    document.getElementById("v2_number").value = w_2[i].toFixed(2);

    document.getElementById("m1_range").value = m1[i].toFixed(2);
    document.getElementById("m2_range").value = m2[i].toFixed(2);
    document.getElementById("l1_range" ).value = l1[i].toFixed(2);
    document.getElementById("l2_range" ).value = l2[i].toFixed(2);
    document.getElementById("a1_range" ).value = (theta1[i] * 180 / Math.PI).toFixed(2);
    document.getElementById("a2_range").value = (theta2[i] * 180 / Math.PI).toFixed(2);
    document.getElementById("v1_range").value = w_1[i].toFixed(2);
    document.getElementById("v2_range").value = w_2[i].toFixed(2);
    
}

/* Drag and drop functionality */

let dragging_pendulum = 0;
canvas.addEventListener("mousedown", function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Check if the mouse click is within the circle
    for (let i = 0; i < pos.length; i++) {
        for(let j = 0; j<2; j++){
            const [circleX, circleY] = cartesian_to_canvas(pos[i][j][0], pos[i][j][1]);
            const distance = Math.sqrt((circleX - x) ** 2 + (circleY - y) ** 2);
            
            if (distance <= circle_radius) {
                if(end==false)
                    play_pause();
                reset();
                end=true;
                // Start dragging the circle
                canvas.addEventListener("mousemove", dragCircle);
                canvas.addEventListener("mouseup", stopDragCircle);
                dragging_pendulum = [i, j];
                selected_pendulum = i;
                return;
            }
        }
        
        
    }
});

function dragCircle(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const i = dragging_pendulum[0];
    const j = dragging_pendulum[1];

    // Update the position of the dragged circle
    pos[i][j][0] = (x - canvas.width / 2) * 4 / min;
    pos[i][j][1] = (canvas.height / 2 - y) * 4 / min;
    
    // Calculate theta1 and theta2 based on the updated position
    theta1[i] = Math.abs(Math.atan2(pos[i][0][1], pos[i][0][0]) + Math.PI / 2);
    theta2[i] = Math.abs(Math.atan2(pos[i][1][1], pos[i][1][0]) + Math.PI / 2);
    if(pos[i][0][0] < 0 && pos[i][0][1] < 0)
        theta1[i] = 2*Math.PI-theta1[i]
    if(pos[i][1][0] < 0 && pos[i][1][1] < 0)
        theta2[i] = 2*Math.PI-theta2[i]
    load_settings();
}

function stopDragCircle() {
    // Stop dragging the circle
    reset();
    end = true;
    canvas.removeEventListener("mousemove", dragCircle);
    canvas.removeEventListener("mouseup", stopDragCircle);
}

/* Connect Inputs */
document.getElementById("m1_range").onchange = function(){
    m1[selected_pendulum] = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("m1_number").value = m1[selected_pendulum];
}
document.getElementById("m1_number").onchange = function(){
    m1[selected_pendulum] = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("m1_range").value = m1[selected_pendulum];
} 

document.getElementById("m2_range").onchange = function(){ 
    m2[selected_pendulum] = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("m2_number").value = m2[selected_pendulum];
}
document.getElementById("m2_number").onchange = function(){
    m2[selected_pendulum] = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("m2_range").value = m2[selected_pendulum];
}

document.getElementById("l1_range").onchange = function(){ 
    l1[selected_pendulum] = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("l1_number").value = l1[selected_pendulum];
}

document.getElementById("l1_number").onchange = function(){
    l1[selected_pendulum] = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("l1_range").value = l1[selected_pendulum];
}

document.getElementById("l2_range").onchange = function(){ 
    l2[selected_pendulum] = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("l2_number").value = l2[selected_pendulum];
}

document.getElementById("l2_number").onchange = function(){
    l2[selected_pendulum] = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("l2_range").value = l2[selected_pendulum];
}

document.getElementById("g_range").onchange = function(){ 
    g = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("g_number").value = g;
}

document.getElementById("g_number").onchange = function(){
    g = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("g_range").value = g;
}

/* Initial conditions */
document.getElementById("a1_range").onchange = function(){ 
    theta1[selected_pendulum] = parseFloat(this.value) * Math.PI / 180;
    document.getElementById("a1_number").value = parseFloat(this.value);
}

document.getElementById("a1_number").onchange = function(){
    theta1[selected_pendulum] = parseFloat(this.value) * Math.PI / 180;
    document.getElementById("a1_range").value = parseFloat(this.value);
}

document.getElementById("a2_range").onchange = function(){ 
    theta2[selected_pendulum] = parseFloat(this.value) * Math.PI / 180;
    document.getElementById("a2_number").value = parseFloat(this.value);
}

document.getElementById("a2_number").onchange = function(){
    theta2[selected_pendulum] = parseFloat(this.value) * Math.PI / 180;
    document.getElementById("a2_range").value = parseFloat(this.value);
}

document.getElementById("v1_range").onchange = function(){ 
    w_1[selected_pendulum] = parseFloat(this.value)
    document.getElementById("v1_number").value = w_1[selected_pendulum];
}

document.getElementById("v1_number").onchange = function(){ 
    w_1[selected_pendulum] = parseFloat(this.value)
    document.getElementById("v1_number").value = w_1[selected_pendulum];
}

document.getElementById("v2_range").onchange = function(){ 
    w_2[selected_pendulum] = parseFloat(this.value)
    document.getElementById("v2_number").value = w_2[selected_pendulum];
}

document.getElementById("v2_number").onchange = function(){ 
    w_2[selected_pendulum] = parseFloat(this.value)
    document.getElementById("v2_number").value = w_2[selected_pendulum];
}

document.getElementById("trajectory1").onchange = function(){
    draw_trajectory1 = this.checked;
    for (let i = 0; i < trajectory1.length; i++) {
        trajectory1[i] = [];
    }
    
}

document.getElementById("trajectory2").onchange = function(){
    draw_trajectory2 = this.checked;
    for(let i = 0; i < trajectory2.length; i++){
        trajectory2[i] = [];
    }
}


/* Main */
resize();
setInterval(draw, time_step*2000);