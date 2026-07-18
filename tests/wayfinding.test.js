/** @jest-environment jsdom */

/**
 * @fileoverview Tests for the SVG stadium wayfinding map.
 */

'use strict';

global.Utils = require('../js/utils');
const Wayfinding = require('../js/wayfinding');

describe('Wayfinding stadium map', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="map"></div>';
  });

  test('renders a soccer pitch with goals on the horizontal short ends', () => {
    Wayfinding.renderMap('map');

    const svg = document.querySelector('#stadium-svg');
    expect(svg).not.toBeNull();

    const field = svg.querySelector('rect[x="210"][y="165"][width="420"][height="270"]');
    const leftGoal = svg.querySelector('rect[x="195"][y="250"][width="15"][height="100"]');
    const rightGoal = svg.querySelector('rect[x="630"][y="250"][width="15"][height="100"]');
    const halfwayLine = svg.querySelector('line[x1="420"][y1="165"][x2="420"][y2="435"]');

    expect(field).not.toBeNull();
    expect(leftGoal).not.toBeNull();
    expect(rightGoal).not.toBeNull();
    expect(halfwayLine).not.toBeNull();
  });
});
