// --------------------------------------------------------------------------
// Canvas/Calculation helpers
// --------------------------------------------------------------------------

// In 2D vector graphics, single-pixel stroke width must be drawn at a half-pixel position, otherwise it gets sub-pixel blurring
export function closestHalfPixel(pixels){
  // parseInt is a hack for efficient rounding 
  return parseInt( 0.5 + pixels ) - 0.5;
}; 

export function drawLine(context, x1, y1, x2, y2, xyFlip, color) {
  if( color )
  {
    context.beginPath();
    context.strokeStyle = color;
  }

  if( xyFlip )
  {
    x1 = [y1, y1 = x1][0];
    x2 = [y2, y2 = x2][0];
  }
  context.moveTo( x1, y1 );
  context.lineTo( x2, y2 );

  if( color )
    context.stroke();
};

export function drawRoundedRectangle(context, left, right, top, bottom, radius) {
  if (radius < 2) {
    if (context.fillStyle)
      context.fillRect(  left, top, right - left, bottom - top)
    if (context.strokeStyle)
      context.strokeRect(left, top, right - left, bottom - top)
  } else {
    context.beginPath()
    context.moveTo(left + radius, top)
    context.lineTo(right - radius, top)
    context.quadraticCurveTo(right, top, right, top + radius)
    context.lineTo(right, bottom - radius)
    context.quadraticCurveTo(right, bottom, right - radius, bottom)
    context.lineTo(left + radius, bottom)
    context.quadraticCurveTo(left, bottom, left, bottom - radius)
    context.lineTo(left, top + radius)
    context.quadraticCurveTo(left, top, left + radius, top)
    context.closePath()
    if (context.fillStyle)
      context.fill()
    if (context.strokeStyle)
      context.stroke()
  }
}
