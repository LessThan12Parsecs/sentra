uniform float time;
uniform vec2 resolution;

void main() {
    vec2 position = (gl_FragCoord.xy / resolution.xy) - 0.5;
    position *= 2.0; // Scale position to range from -1 to 1
    float distance = length(position); // Calculate distance from center

    // Create a pulsating effect based on distance and time
    float pulse = sin(time + distance * 10.0) * 0.5 + 0.5;

    // Calculate color components with different frequencies and phases
    float red = sin(time * 1.3 + position.x * 6.2831) * 0.5 + 0.5;
    float green = sin(time * 1.7 + position.y * 6.2831) * 0.5 + 0.5;
    float blue = sin(time * 2.1 + distance * 12.566) * 0.5 + 0.5;

    // Combine color components and apply the pulsating effect
    vec3 color = vec3(red, green, blue) * pulse;

    // Output the final color
    gl_FragColor = vec4(color, 1.0);
}
