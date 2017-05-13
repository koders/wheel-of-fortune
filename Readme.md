Front-end developer test assignment
==============
Description
--------------
Your task is to create a simple Wheel of Fortune game using the provided assets (images and sounds) and a skeleton PixiJS project provided to you. The skeleton project is using ES6 but you are free to switch to TypeScript if you wish.
### Basic requirements
The user is presented with a centered wheel and an arrow pointed to it.
When the user clicks anywhere on the screen, the wheel starts spinning until it stops with arrow pointing to a random value.
The “spin” sound starts playing when the wheel begins to spin.
When the wheel stops, the user is presented with a winning value matching the winning sector.
The value is ticking up from 0 to the value selected on the wheel and the “win” sound is playing.
After the winning value disappears, the user is able to spin the wheel again.

#### Details:
    1. A new random value should be won each time the wheel spins;
    2. On each spin, the wheel should rotate for at least 720 degrees during 2-4 seconds;
    3. The win values should tick with 0.25 second interval and the resulting value should be presented to the user for 2 more seconds until it disappears.
    4. Always position the wheel at the center of the screen.

See preview.mp4 for a demo of the final result.
    
### Advanced requirements
The basic requirements were too easy to implement and you spent less than 3 hours on them?
You may implement any or all of these additional points:

    1. Add easing effects for the wheel start and stop;
    2. Make the arrow shake when it passes every sector of the wheel.
    3. Animate the resulting value disappearance with opacity and scale.
    4. Optimize the provided images into a Sprite Sheet.
    5. Pack the provided sounds into a Sound Sprite.
    6. Scale down the wheel to fit the screen if the screen is too small for it to fit.
    
**Good luck!**
