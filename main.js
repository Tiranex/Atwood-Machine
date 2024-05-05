const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');

/* Variables */
let L=0.5;
let r=0.75;
let theta = Math.PI;
let Total_Length = 2;
let L_height;
let pos_m = [r*Math.cos(theta-Math.PI/2), r*Math.sin(theta-Math.PI/2)];
theta = Math.PI/2;
let end = false;
/* Constantes SISTEMA */
let m = 200;
let M = 450;
let g = 9.81;
const time_step = 0.01;
let y = [r, 0, Math.PI/2, 0]; 
/*COLORS */
const background_color = "#333";
const axis_color = "white";
const circle_colors = ["red", "blue"]; // red for M || blue for m
const circle_radius = [20, 30];
/* Trajectories */
const max_trajectory=5000;
const trajectory_color = "white";
const trajectory_radius = 0.15;
let trajectory_index=0;
let trajectory =new Array(max_trajectory).fill(0);
let draw_trajectory_check = true;


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

function draw_elements(){
    // Linea aux
    context.beginPath();
    context.moveTo(...cartesian_to_canvas(-L, L_height));
    context.lineTo(...cartesian_to_canvas(L, L_height));
    context.stroke();
    context.closePath();
    

    // m pequeña
    context.beginPath();
    context.moveTo(...cartesian_to_canvas(-L, L_height));
    const cart_pos = cartesian_to_canvas(pos_m[0] - L, L_height + pos_m[1]);
    context.lineTo(...cart_pos);
    context.stroke();
    context.closePath();
    
    context.fillStyle= circle_colors[0];
    context.beginPath();
    context.arc(...cart_pos, circle_radius[0], 0, 2*Math.PI);
    context.fill();
    context.closePath();

    // text for m
    context.fillStyle="white";
    context.font = '20px Helvetica';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText("m", ...cart_pos);
    
    // M grande
    context.beginPath();
    context.moveTo(...cartesian_to_canvas(L, L_height));
    context.lineTo(...cartesian_to_canvas(L,  L_height - (Total_Length-y[0])));
    context.stroke();
    context.closePath();

    context.fillStyle = circle_colors[1];
    context.beginPath();
    context.arc(...cartesian_to_canvas(L,  L_height - (Total_Length-y[0])), circle_radius[1], 0, 2*Math.PI);
    context.fill();
    context.closePath();

    // text for M
    context.fillStyle="white";
    context.font = '20px Helvetica';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText("M", ...cartesian_to_canvas(L,  L_height - (Total_Length-y[0])));

}

function draw_variables() {
    context.font = "15px Montserrat";
    context.fillStyle = "white";
    context.textAlign = "right";
    context.fillText("Valores Actuales", canvas.width - 10, 30);
    context.fillText(`r: ${y[0].toFixed(2)}`, canvas.width - 10, 50);
    const thetaDegrees = ((y[2] * 180 / Math.PI) % 360).toFixed(2);
    context.fillText(`θ: ${thetaDegrees}°`, canvas.width - 10, 70);

    context.textAlign = "left";
    context.fillText("Parámetros Actuales", 30, 30);
    const thetaDegrees_2 = ((theta * 180 / Math.PI) % 360).toFixed(2);
    context.fillText(`μ: ${(M/m).toFixed(2)} || θ0: ${thetaDegrees_2}`, 30, 50);
}


function draw_trajectory(){
    if(!draw_trajectory_check)
        return;

    context.fillStyle= trajectory_color;
    
    /* Trajectory radius 
    for(let i = 0; i< trajectory_index; i++){
        context.beginPath();
        const cart_pos = cartesian_to_canvas(trajectory[i][0] - L, L_height + trajectory[i][1]);
        context.arc(...cart_pos, trajectory_radius, 0, 2*Math.PI);
        context.fill();
        context.closePath();
    } */
    
    context.beginPath(); 
    context.moveTo(...cartesian_to_canvas(trajectory[0][0] -L, L_height + trajectory[0][1]));
    for(let i = 1; i< trajectory_index; i++){
        const cart_pos = cartesian_to_canvas(trajectory[i][0] - L, L_height + trajectory[i][1]);
        context.lineTo(...cart_pos);
    }

    context.stroke();
    context.closePath();
}
function draw(){
    draw_axis();
    draw_axis_labels();
    draw_trajectory();
    draw_variables();
    draw_elements();
    update();
}

function update(){
    if(end)
        return;
    solve();
}

function solve(){
    y = runge_Kutta(0, y, f, time_step, 0)
    pos_m = [y[0]*Math.cos(y[2]-Math.PI/2), y[0]*Math.sin(y[2]-Math.PI/2)]
    
    trajectory[trajectory_index] = pos_m.slice();
    
    trajectory_index++;
    if(trajectory_index == max_trajectory)
        trajectory_index=0;
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

function canvas_to_cartesian(x, y){
    return [(x - canvas.width/2) * 4/min, (canvas.height/2 - y) * 4/min];
}

window.onresize = resize;

/* Solver */
function f(yprime, y, i, t){
    // y = [r, pr, theta, ptheta]
    yprime[0] = y[1] / (m + M);
    yprime[1] = y[3]**2 / (m*y[0]**3) - M*g + m*g*Math.cos(y[2]);
    yprime[2] = y[3] / (m * y[0]**2);
    yprime[3] = -m * g * y[0] * Math.sin(y[2]);
    
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

function reset(){
    y = [r, 0, theta, 0];
    cleartrajectory();
    end = false;
}

/* Variable for orbits */
let current_orbit = 0;
let orbits = 
function next_orbit(){
    
}

document.getElementById("reset").onclick = reset;

document.getElementById("shuffle").onclick;

document.getElementById("m_range").onchange = function(){
    m = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("m_number").value = m;
}
document.getElementById("m_number").onchange = function(){
    m = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("m_range").value = m;
} 

document.getElementById("M_range").onchange = function(){ 
    M = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("M_number").value = M;
}
document.getElementById("M_number").onchange = function(){
    M = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("M_range").value = M;
}

document.getElementById("l_horizontal").onchange = function(){ 
    L = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("l_horizontal_number").value = L;
}

document.getElementById("l_total").onchange = function(){
    Total_Length = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("l_total_number").value = Total_Length;
}

document.getElementById("l_total_number").onchange = function(){ 
    Total_Length = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("l_total").value = Total_Length;
}

/* Initial Conditions */
document.getElementById("rrange").onchange = function(){
    r = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("rtotal").value = r;
}

document.getElementById("rtotal").onchange = function(){ 
    r = parseFloat(parseFloat(this.value).toFixed(2));
    document.getElementById("rrange").value = r;
}

document.getElementById("angle_range").onchange = function(){
    theta = parseFloat(parseFloat(this.value).toFixed(2)) * (Math.PI / 180);
    document.getElementById("angle_number").value = parseFloat(parseFloat(this.value).toFixed(2));
}

document.getElementById("angle_number").onchange = function(){ 
    theta = parseFloat(parseFloat(this.value).toFixed(2)) * (Math.PI / 180);
    document.getElementById("angle_range").value = parseFloat(parseFloat(this.value).toFixed(2));
}



document.getElementById("trajectory_check").onchange = function(){
    draw_trajectory_check = this.checked;
    cleartrajectory();
}

function cleartrajectory(){
    trajectory =new Array(max_trajectory).fill(0);
    trajectory[0] = pos_m.slice();
    trajectory_index=0; 
}

function load_settings(settings){
    // settings m M g r angle
    document.getElementById("m_range").value = settings[0];
    document.getElementById("m_number").value = p(settings[0]);

    document.getElementById("M_range").value = settings[1];
    document.getElementById("M_number").value = settings[1];

    document.getElementById("g_range").value=settings[2];
    document.getElementById("g_number").value=settings[2];

    document.getElementById("rrange").value=settings[3];
    document.getElementById("rtotal").value=settings[3];

    document.getElementById("angle_range").value=settings[4];
    document.getElementById("angle_number").value=settings[4];
    
    m=settings[0];
    M=settings[1];
    g=settings[2];
    r=settings[3];
    theta = settings[4];

}

/* Main */
resize();
L_height = canvas_to_cartesian(0, canvas.height/3)[1];
setInterval(draw, time_step*2000);