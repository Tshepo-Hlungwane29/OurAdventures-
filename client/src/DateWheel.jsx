import { useState } from 'react';

const activities = [
  { name: "Movie night", weight: 1, icon: "🎬" },
  { name: "Restaurant of Tshepo's choosing", weight: 1, icon: "🍽️" },
  { name: "Restaurant of Priscar's choosing", weight: 1, icon: "🥂" },
  { name: "Movie night with wine and sushi", weight: 1, icon: "🍣" },
  { name: "Movie night with snacks, no alcohol", weight: 1, icon: "🍿" },
  { name: "Strictly sushi date", weight: 1, icon: "🍱" },
  { name: "Strictly grilled date", weight: 1, icon: "🥩" },
  { name: "Go for drinks", weight: 1, icon: "🍹" },
  { name: "Picnic", weight: 1, icon: "🧺" },
  { name: "Hiking", weight: 1, icon: "🥾" },
  { name: "Bowling", weight: 1, icon: "🎳" },
  { name: "Try a new restaurant", weight: 1, icon: "🍴" },
  { name: "Braai together", weight: 1, icon: "🔥" },
  { name: "Let's get high", weight: 1, icon: "🌿" },
  { name: "Visit a museum", weight: 1, icon: "🏛️" },
  { name: "Spa date", weight: 1, icon: "💆" },
  { name: "Pizza date", weight: 1, icon: "🍕" },
  { name: "Go to the zoo", weight: 1, icon: "🦁" },
  { name: "Travel to another city", weight: 0.08, icon: "🚗" },
  { name: "Gift each other", weight: 1, icon: "🎁" },

  // New activities
  { name: "Church & lunch", weight: 1, icon: "⛪" },
  { name: "Any activity in Harties", weight: 1, icon: "🌊" },
  { name: "Kasi experience (Chisanyama)", weight: 1, icon: "🔥" },
  { name: "African cuisine date", weight: 1, icon: "🍲" },
  { name: "Explore food from any culture", weight: 1, icon: "🌍" }
];

const colors = [
  "#71866A", "#A5A77B", "#D5C49A", "#E8DDC4",
  "#65795D", "#B9AA82", "#849477", "#D8C9A7",
  "#71866A", "#A5A77B", "#D5C49A", "#E8DDC4",
  "#65795D", "#B9AA82", "#849477", "#D8C9A7",
  "#71866A", "#A5A77B", "#D5C49A", "#E8DDC4",
  "#65795D", "#B9AA82", "#849477", "#D8C9A7",
  "#A5A77B"
];

function DateWheel({ onAccept }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState(null);

  const totalWeight = activities.reduce(
    (total, activity) => total + activity.weight, 0
  );

  function chooseActivity() {
    let random = Math.random() * totalWeight;

    for (let i = 0; i < activities.length; i++) {
      random -= activities[i].weight;

      if (random <= 0) return i;
    }

    return activities.length - 1;
  }

  function spinWheel() {
    if (spinning) return;

    setSelected(null);
    setSpinning(true);

    const winner = chooseActivity();

    const segmentAngle = 360 / activities.length;
    const segmentCenter = winner * segmentAngle + segmentAngle / 2;

    const current = rotation % 360;

    const adjustment =
      ((360 - ((segmentCenter + current) % 360)) % 360);

    const newRotation = rotation + (360 * 6) + adjustment;

    setRotation(newRotation);

    setTimeout(() => {
      setSelected(activities[winner]);
      setSpinning(false);
    }, 5500);
  }

  return (
    <section className="wheel-section" id="date-wheel">

      <p className="wheel-eyebrow">LET FATE DECIDE</p>

      <h2>Where will our next adventure take us?</h2>

      <p className="wheel-description">
        Close your eyes, make a wish and let the wheel decide.
      </p>

      <div className="wheel-container">

        <div className="wheel-pointer">▼</div>

        <svg
          viewBox="0 0 400 400"
          className="wheel-svg"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? 'transform 5.5s cubic-bezier(0.12, 0.75, 0.12, 1)'
              : 'none'
          }}
        >

          {activities.map((activity, index) => {

            const angle = 360 / activities.length;
            const start = index * angle - 90;
            const end = start + angle;

            const x1 = 200 + 195 * Math.cos(start * Math.PI / 180);
            const y1 = 200 + 195 * Math.sin(start * Math.PI / 180);

            const x2 = 200 + 195 * Math.cos(end * Math.PI / 180);
            const y2 = 200 + 195 * Math.sin(end * Math.PI / 180);

            const middle = start + angle / 2;

            const textX = 200 + 133 * Math.cos(middle * Math.PI / 180);
            const textY = 200 + 133 * Math.sin(middle * Math.PI / 180);

            return (
              <g key={index}>
                <path
                  d={`M 200 200 L ${x1} ${y1} A 195 195 0 0 1 ${x2} ${y2} Z`}
                  fill={colors[index]}
                  stroke="#F5EBD8"
                  strokeWidth="2"
                />

                <text
                  x={textX}
                  y={textY}
                  fill="#263B2C"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {activity.icon}
                </text>
              </g>
            );
          })}

          <circle
            cx="200"
            cy="200"
            r="38"
            fill="#F5EBD8"
            stroke="#B99A5C"
            strokeWidth="4"
          />

          <text
            x="200"
            y="205"
            textAnchor="middle"
            fontSize="22"
            fill="#52664C"
          >
            ♡
          </text>

        </svg>

      </div>

      <button
        className="spin-button wheel-spin-button"
        onClick={spinWheel}
        disabled={spinning}
      >
        {spinning ? "YOUR FATE IS DECIDING..." : "♡ SPIN THE WHEEL ♡"}
      </button>

      {selected && (

        <div className="result-card">

          <p>THE WHEEL HAS SPOKEN! ✨</p>

          <h3>{selected.icon} {selected.name}</h3>

          <p>Looks like we've got an adventure to plan!</p>

          <div className="result-buttons">

            <button
              onClick={() => onAccept(selected)}
              className="accept-button"
            >
              ACCEPT ADVENTURE ❤️
            </button>

            <button
              onClick={spinWheel}
              className="again-button"
            >
              SPIN AGAIN
            </button>

          </div>

        </div>

      )}

    </section>
  );
}

export default DateWheel;