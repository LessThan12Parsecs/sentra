uniform float time;
uniform vec2 resolution;
uniform float duration;

void main() {
    float progress = (time / (duration * 0.001)); // Calculate how close we are to the duration
    vec2 position = (gl_FragCoord.xy / resolution.xy) - 0.5;
        position *= 2.0; // Scale position to range from -1 to 1
        float distance = length(position); // Calculate distance from center

        // Adjust the pulsating effect based on progress towards duration
        float pulse = sin(time * (1.0 + progress) + distance * 10.0) * 0.5 + 0.5;

        // Calculate color components with different frequencies, phases, and adjust based on progress
        float red = sin(time * (1.3 + progress) + position.x * 6.2831) * 0.5 + 0.5;
        float green = sin(time * (1.7 + progress) + position.y * 6.2831) * 0.5 + 0.5;
        float blue = sin(time * (2.1 + progress) + distance * 12.566) * 0.5 + 0.5;

        // Combine color components and apply the adjusted pulsating effect
        vec3 color = vec3(red, green, blue) * pulse;

        // Scale the color intensity from 0 to full based on progress
        color *= progress + 0.1;
        // Output the final color
    if (progress >= 0.9){
       float red = sin(1.0 * (1.3 + progress) + position.x * 6.2831) * 0.5 + 0.5;
        float green = sin(1.0 * (1.7 + progress) + position.y * 6.2831) * 0.5 + 0.5;
        float blue = sin(1.0 * (2.1 + progress) + distance * 12.566) * 0.5 + 0.5;
        vec3 color = vec3(red, green, blue);
        gl_FragColor = vec4(color, 1.0); // Use alpha for circular shape
    }
    else {
        gl_FragColor = vec4(color, 0.95);
    }
}

