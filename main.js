var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var X = 0;
var Y = c.height - c.height / 1.75;
var imageHeight = c.height / 1.75;
var imageWidth = c.width / 1.75;



let loadImage = (src, callback) => {
  let img = document.createElement("img");
  img.onload = () => callback(img);
  img.src = src;
};


let imgToPath = (n, animation) => {
  if (animation === "background") {
    return "./data/" + animation + ".jpg";
  }
  src = "./data/" + animation + "/";
  return src + n.toString() + ".png";
};

let frames = {
  idle: [1, 2, 3, 4, 5, 6, 7, 8],
  kick: [1, 2, 3, 4, 5, 6, 7],
  punch: [1, 2, 3, 4, 5, 6, 7],
  forward: [1, 2, 3, 4, 5, 6],
  backward: [1, 2, 3, 4, 5, 6],
  block: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  background: [1],
};

let loadImages = (callback) => {
  
  let images = {
    idle: [],
    kick: [],
    punch: [],
    forward: [],
    backward: [],
    block: [],
    background: [],
  };
  let cnt = 0;
  [
    "idle",
    "kick",
    "punch",
    "forward",
    "backward",
    "block",
    "background",
  ].forEach((animation) => {
    let animationFrames = frames[animation];
    cnt += animationFrames.length;
    animationFrames.forEach((n) => {
      let path = imgToPath(n, animation);
      loadImage(path, (image) => {
        images[animation][n - 1] = image;
        cnt -= 1;
        if (cnt === 0) {
          callback(images);
        }
      });
    });
  });
};

let manipulateStep = (animation, index, len) => {
  let stepX = 0,
    stepY = 0;
  if (animation === "forward") {
    stepX += index;
  } else if (animation === "backward") {
    stepX -= index;
  } else {
    // here len = 6
    let max_jump_height = len / 2; // 3
    if (index > max_jump_height) {
      stepY += len - index;
    } else {
      stepY += index;
    }
  }
  return [stepX, stepY];
};
let drawMovingAnimation = (ctx, images, animation, callback) => {
  if (animation === "jump") {
    animation = "idle"; 
  }
  images[animation].forEach((image, index) => {
    let [stepX, stepY] = manipulateStep(
      animation,
      index,
      images[animation].length
    );
    let advanceCheck = () => {
      console.log("X= ", X);
      if (X <= -50) return (X = -50);
      else if (X + imageWidth >= c.width + 10)
        return (X = c.width - imageWidth + 10);
      return (X += stepX * 2);
    };
    setTimeout(() => {
      ctx.clearRect(
        advanceCheck(),
        Y - (stepY - 1) * 2,
        imageWidth,
        imageHeight
      );
      ctx.clearRect(
        (X += stepX * 5),
        Y - (stepY + 1) * 2,
        imageWidth,
        imageHeight
      );
      ctx.drawImage(images["background"][0], 0, 0, c.width, c.height);
      ctx.drawImage(image, X + stepX, Y - stepY * 20, imageWidth, imageHeight);
    }, index * 60);
  });
 
  setTimeout(callback, images[animation].length * 60);
};

let animate = (ctx, images, animation, callback) => {
  let movableAnimation = ["forward", "backward", "jump"];

  if (!movableAnimation.includes(animation)) {
    images[animation].forEach((image, index) => {
      setTimeout(() => {
        ctx.clearRect(X, Y, imageWidth, imageHeight);
        ctx.drawImage(images["background"][0], 0, 0, c.width, c.height);
        ctx.drawImage(image, X, Y, imageWidth, imageHeight);
      }, index * 60);
    });
    setTimeout(callback, images[animation].length * 60);
  } else {
    drawMovingAnimation(ctx, images, animation, callback);
  }
};
loadImages((images) => {
  ctx.drawImage(images["background"][0], 0, 0, c.width, c.height);

  let animationQueue = [];

  let recAnimation = () => {
    let selectAnimation;
    if (animationQueue.length === 0) {
      selectAnimation = "idle";
    } else {
      selectAnimation = animationQueue.shift();
    }

    animate(ctx, images, selectAnimation, recAnimation);
  };
  recAnimation();
  document.getElementById("kick").onclick = () => {
    animationQueue.push("kick");
  };
  document.getElementById("punch").onclick = () => {
    animationQueue.push("punch");
  };
  document.getElementById("forward").onclick = () => {
    animationQueue.push("forward");
  };
  document.getElementById("backward").onclick = () => {
    animationQueue.push("backward");
  };
  document.getElementById("block").onclick = () => {
    animationQueue.push("block");
  };
  document.getElementById("jump").onclick = () => {
    animationQueue.push("jump");
  };

  document.addEventListener("keyup", (event) => {
    const key = event.key;
    if (key === "ArrowLeft") {
      animationQueue.push("backward");
    } else if (key === "ArrowRight") {
      animationQueue.push("forward");
    } else if (event.code === "ArrowUp") {
      animationQueue.push("jump");
    } else if (event.code == "KeyC") {
      animationQueue.push("block");
    } else if (event.code == "KeyZ") {
      animationQueue.push("punch");
    } else if (event.code == "KeyX") {
      animationQueue.push("kick");
    }
  });
});
