import { useState, useEffect } from 'react';
import './App.css';
import DateWheel from './DateWheel';
import PhotoUpload from './PhotoUpload';

const API_URL = 'https://ouradventures.onrender.com/api/adventures';
const MEMORY_API = 'https://ouradventures.onrender.com/api/memories';
const LOVE_NOTE_API = 'https://ouradventures.onrender.com/api/love-notes';

function App() {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [adventureDate, setAdventureDate] = useState('');
  const [confirmedDate, setConfirmedDate] = useState(null);
  const [confirmedActivity, setConfirmedActivity] = useState(null);
  const [confirmedAdventureId, setConfirmedAdventureId] = useState(null);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Memory states
  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [memoryDescription, setMemoryDescription] = useState('');
  const [memoryRating, setMemoryRating] = useState(10);
  const [specialMessage, setSpecialMessage] = useState('');
  const [isSavingMemory, setIsSavingMemory] = useState(false);
  const [memoryPhotos, setMemoryPhotos] = useState([]);
  const [memories, setMemories] = useState([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(false);

  // Love Notes states
  const [loveNotes, setLoveNotes] = useState([]);
  const [loveNoteMessage, setLoveNoteMessage] = useState('');
  const [loveNoteFrom, setLoveNoteFrom] = useState('Tshepo');
  const [loveNoteTo, setLoveNoteTo] = useState('Priscar');
  const [isSurprise, setIsSurprise] = useState(false);
  const [isSavingLoveNote, setIsSavingLoveNote] = useState(false);
  const [isLoadingLoveNotes, setIsLoadingLoveNotes] = useState(false);
  const [loveNoteFeedback, setLoveNoteFeedback] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the next Saturday or Sunday.
  function getNextWeekendDate(date) {
    const result = new Date(date);
    result.setHours(12, 0, 0, 0);

    while (result.getDay() !== 0 && result.getDay() !== 6) {
      result.setDate(result.getDate() + 1);
    }

    return result;
  }

  // Calculate the next adventure date.
  function getNextEligibleDate(date) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 14);

    return getNextWeekendDate(nextDate);
  }

  const minimumDate = confirmedDate
    ? getNextEligibleDate(confirmedDate)
    : getNextWeekendDate(new Date(today.getTime() + 86400000));

  const dateLimit = new Date(today);
  dateLimit.setDate(dateLimit.getDate() + 180);

  const formatDate = (date) =>
    date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  // Load adventures from MongoDB.
  async function loadAdventure() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Could not retrieve adventures.');
      }

      const adventures = await response.json();

      const plannedAdventure = adventures.find(
        (adventure) => adventure.status === 'planned'
      );

      const completedAdventures = adventures.filter(
        (adventure) => adventure.status === 'completed'
      );

      const latestCompleted = completedAdventures.length > 0
        ? completedAdventures[completedAdventures.length - 1]
        : null;

      const adventure = plannedAdventure || latestCompleted;

      if (adventure) {
        setConfirmedAdventureId(adventure._id);

        setConfirmedActivity({
          name: adventure.activity,
          icon: adventure.icon
        });

        setConfirmedDate(new Date(adventure.adventureDate));

        if (adventure.status === 'completed') {
          setShowMemoryForm(true);
        }
      }

    } catch (error) {
      console.error('Error loading adventure:', error);
      setMessage('Unable to load our saved adventure. Please try again.');
    }
  }

  // Load memories from MongoDB.
  async function loadMemories() {
    setIsLoadingMemories(true);

    try {
      const response = await fetch(MEMORY_API);

      if (!response.ok) {
        throw new Error('Could not retrieve memories.');
      }

      const savedMemories = await response.json();
      setMemories(savedMemories);

    } catch (error) {
      console.error('Error loading memories:', error);
      setMessage('Unable to load our memories. Please try again.');

    } finally {
      setIsLoadingMemories(false);
    }
  }

  // Load Love Notes from MongoDB.
  async function loadLoveNotes() {
    setIsLoadingLoveNotes(true);

    try {
      const response = await fetch(LOVE_NOTE_API);

      if (!response.ok) {
        throw new Error('Could not retrieve love notes.');
      }

      const savedLoveNotes = await response.json();
      setLoveNotes(savedLoveNotes);

    } catch (error) {
      console.error('Error loading love notes:', error);
      setLoveNoteFeedback('Unable to load our love notes. Please try again.');

    } finally {
      setIsLoadingLoveNotes(false);
    }
  }

  // Load saved information when the website opens.
  useEffect(() => {
    loadAdventure();
    loadMemories();
    loadLoveNotes();
  }, []);

  // Save a Love Note to MongoDB.
  async function saveLoveNote() {
    if (!loveNoteMessage.trim()) {
      setLoveNoteFeedback('❤️ Please write a love note first.');
      return;
    }

    setIsSavingLoveNote(true);
    setLoveNoteFeedback('');

    try {
      const response = await fetch(LOVE_NOTE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: loveNoteMessage,
          from: loveNoteFrom,
          to: loveNoteTo,
          isSurprise: isSurprise
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Could not save love note.');
      }

      setLoveNotes((previousNotes) => [result, ...previousNotes]);
      setLoveNoteMessage('');
      setIsSurprise(false);
      setLoveNoteFeedback('❤️ Your love note has been saved!');

    } catch (error) {
      console.error('Error saving love note:', error);
      setLoveNoteFeedback('Unable to save your love note. Please try again.');

    } finally {
      setIsSavingLoveNote(false);
    }
  }

  // Accept an activity from the wheel.
  function handleAccept(activity) {
    if (confirmedDate && today < getNextEligibleDate(confirmedDate)) {
      setMessage(
        `❤️ Our next adventure can only be planned from ${formatDate(
          getNextEligibleDate(confirmedDate)
        )}. Our next adventure is just two weeks away!`
      );
      return;
    }

    setSelectedActivity(activity);
    setAdventureDate('');
    setMessage('');

    document.getElementById('date-planner')?.scrollIntoView({
      behavior: 'smooth'
    });
  }

  // Validate the selected date.
  function handleDateChange(value) {
    if (!value) {
      setAdventureDate('');
      setMessage('');
      return;
    }

    const chosenDate = new Date(`${value}T12:00:00`);
    const day = chosenDate.getDay();

    if (day !== 0 && day !== 6) {
      setAdventureDate('');
      setMessage('❤️ Please choose a Saturday or Sunday.');
      return;
    }

    const earliestAllowedDate = new Date(minimumDate);
    earliestAllowedDate.setHours(0, 0, 0, 0);

    if (chosenDate < earliestAllowedDate) {
      setAdventureDate('');
      setMessage(
        `❤️ Our next adventure must be on or after ${formatDate(minimumDate)}.`
      );
      return;
    }

    setAdventureDate(value);
    setMessage('');
  }

  // Save the confirmed adventure to MongoDB.
  async function confirmAdventure() {
    if (!adventureDate || !selectedActivity || isSaving) return;

    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          activity: selectedActivity.name,
          icon: selectedActivity.icon,
          adventureDate: adventureDate,
          status: 'planned',
          chosenBy: 'Both'
        })
      });

      const savedAdventure = await response.json();

      if (!response.ok) {
        throw new Error(savedAdventure.message || 'Could not save adventure.');
      }

      setConfirmedAdventureId(savedAdventure._id);

      setConfirmedActivity({
        name: savedAdventure.activity,
        icon: savedAdventure.icon
      });

      setConfirmedDate(new Date(savedAdventure.adventureDate));

      setSelectedActivity(null);
      setAdventureDate('');
      setMessage('');

      document.querySelector('.confirmed-section')?.scrollIntoView({
        behavior: 'smooth'
      });

    } catch (error) {
      console.error('Error saving adventure:', error);
      setMessage('❤️ We could not save your adventure. Please try again.');

    } finally {
      setIsSaving(false);
    }
  }

  // Mark an adventure as completed.
  async function completeAdventure() {
    if (!confirmedAdventureId) {
      setMessage('Unable to identify our saved adventure.');
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${confirmedAdventureId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'completed'
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Could not complete adventure.');
      }

      setMessage('❤️ Adventure completed! Time to save the memory.');
      setShowMemoryForm(true);

    } catch (error) {
      console.error('Error completing adventure:', error);
      setMessage('Unable to complete our adventure. Please try again.');
    }
  }

  // Save a memory to MongoDB.
  async function saveMemory() {
    if (!confirmedAdventureId || !confirmedDate) {
      setMessage('Unable to identify our completed adventure.');
      return;
    }

    if (!memoryDescription.trim()) {
      setMessage('❤️ Please write something about your adventure.');
      return;
    }

    setIsSavingMemory(true);
    setMessage('');

    try {
      const response = await fetch(MEMORY_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adventure: confirmedAdventureId,
          title: confirmedActivity.name,
          description: memoryDescription,
          photos: memoryPhotos,
          rating: memoryRating,
          specialMessage: specialMessage,
          memoryDate: confirmedDate.toISOString(),
          createdBy: 'Both'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Could not save memory.');
      }

      setMessage('❤️ Our memory has been saved successfully!');
      setShowMemoryForm(false);
      setMemoryPhotos([]);

      await loadMemories();

    } catch (error) {
      console.error('Error saving memory:', error);
      setMessage('Unable to save our memory. Please try again.');

    } finally {
      setIsSavingMemory(false);
    }
  }

  // Countdown timer.
  useEffect(() => {
    const updateCountdown = () => {
      let targetDate;

      if (!confirmedDate) {
        targetDate = getNextWeekendDate(
          new Date(Date.now() + 86400000)
        );
      } else if (Date.now() < confirmedDate.getTime()) {
        targetDate = confirmedDate;
      } else {
        targetDate = getNextEligibleDate(confirmedDate);
      }

      const difference = targetDate.getTime() - Date.now();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / 86400000),
        hours: Math.floor((difference % 86400000) / 3600000),
        minutes: Math.floor((difference % 3600000) / 60000),
        seconds: Math.floor((difference % 60000) / 1000)
      });
    };

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [confirmedDate]);

  const cycleLocked =
    confirmedDate &&
    today < getNextEligibleDate(confirmedDate);

  return (
    <div className="website">

      <div className="overlay">

       <header className="navbar">

  <h2>♡ Our Little Adventures</h2>

  <nav className="navigation-menu">
    <a href="#home">Home</a>
    <a href="#date-wheel">Spin the Wheel</a>
    <a href="#memory-lane">Our Memories</a>
    <a href="#love-notes">Love Notes</a>
  </nav>

  <span>Tshepo & Priscar</span>

</header>

        <main className="hero" id="home">

          <p className="eyebrow">OUR LITTLE WORLD</p>

          <h1>
            Every love story
            <br />
            deserves an adventure.
          </h1>

          <p className="subtitle">
            Two people. Countless memories.
            <br />
            One new adventure every two weeks.
          </p>

          <div className="countdown">

            <span>OUR NEXT ADVENTURE</span>

            {timeLeft ? (
              <>
                <h2>{timeLeft.days} DAYS</h2>

                <p>
                  {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
                </p>
              </>
            ) : (
              <h2>LET'S PLAN ❤️</h2>
            )}

            <p>
              {cycleLocked
                ? 'Our next adventure is getting closer ♡'
                : 'Something special is waiting for us ♡'}
            </p>

          </div>

          <button
            className="spin-button"
            onClick={() =>
              document.getElementById('date-wheel')?.scrollIntoView({
                behavior: 'smooth'
              })
            }
          >
            ♡ SPIN OUR WHEEL ♡
          </button>

          {message && (
            <p className="date-error">{message}</p>
          )}

          {cycleLocked && (
            <p className="bottom-text">
              ♡ Our next adventure can be planned from{' '}
              {formatDate(getNextEligibleDate(confirmedDate))}.
            </p>
          )}

          <p className="bottom-text">
            Made with love, for Tshepo & Priscar.
          </p>

        </main>

        <div id="date-wheel">
  <DateWheel onAccept={handleAccept} />
</div>

        {selectedActivity && (
          <section className="planner-section" id="date-planner">

            <div className="planner-card">

              <p className="wheel-eyebrow">OUR NEXT ADVENTURE</p>

              <h2>We have a date! ❤️</h2>

              <h3>
                {selectedActivity.icon} {selectedActivity.name}
              </h3>

              <p>
                Now let's decide when we're making this happen.
              </p>

              <label htmlFor="adventure-date">
                Choose your adventure date
              </label>

              <input
                id="adventure-date"
                type="date"
                min={minimumDate.toISOString().split('T')[0]}
                max={dateLimit.toISOString().split('T')[0]}
                value={adventureDate}
                onChange={(e) => handleDateChange(e.target.value)}
              />

              <p className="weekend-note">
                ♡ Our adventures are reserved for weekends.
                Saturday or Sunday, just the two of us.
              </p>

              {message && (
                <p className="date-error">{message}</p>
              )}

              {adventureDate && (
                <p className="selected-date">
                  Your adventure: {formatDate(
                    new Date(`${adventureDate}T12:00:00`)
                  )}
                </p>
              )}

              <button
                className="accept-button"
                onClick={confirmAdventure}
                disabled={isSaving || !adventureDate}
              >
                {isSaving ? 'SAVING...' : 'CONFIRM OUR ADVENTURE ❤️'}
              </button>

            </div>

          </section>
        )}

        {confirmedDate && confirmedActivity && (
          <section className="confirmed-section">
            <div className="planner-card">

              <p className="wheel-eyebrow">IT'S OFFICIAL!</p>

              <h2>Our next adventure is booked! ❤️</h2>

              <h3>
                {confirmedActivity.icon} {confirmedActivity.name}
              </h3>

              <p>
                📅 {formatDate(confirmedDate)}
              </p>

              <p>Tshepo & Priscar have plans!</p>

              <p>♡ Let the countdown begin!</p>

              <button
                className="accept-button"
                onClick={completeAdventure}
              >
                COMPLETE OUR ADVENTURE ❤️
              </button>

            </div>
          </section>
        )}

        {showMemoryForm && (
          <section className="planner-section">
            <div className="planner-card">

              <p className="wheel-eyebrow">A MEMORY TO KEEP</p>

              <h2>Let's remember this adventure! ❤️</h2>

              <h3>
                {confirmedActivity?.icon} {confirmedActivity?.name}
              </h3>

              <p>
                📅 {confirmedDate && formatDate(confirmedDate)}
              </p>

              <PhotoUpload
                onUpload={(photoUrl) => {
                  setMemoryPhotos((previousPhotos) => [
                    ...previousPhotos,
                    photoUrl
                  ]);
                }}
              />

              {memoryPhotos.length > 0 && (
                <div className="memory-photo-preview">
                  {memoryPhotos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Adventure memory ${index + 1}`}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        margin: '5px'
                      }}
                    />
                  ))}
                </div>
              )}

              <label htmlFor="memory-description">
                Tell us about your adventure
              </label>

              <textarea
                id="memory-description"
                value={memoryDescription}
                onChange={(e) => setMemoryDescription(e.target.value)}
                placeholder="What did we do? How was it? What made it special?"
                rows="5"
              />

              <label htmlFor="memory-rating">
                Rate our adventure out of 10
              </label>

              <select
                id="memory-rating"
                value={memoryRating}
                onChange={(e) => setMemoryRating(Number(e.target.value))}
              >
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}/10
                  </option>
                ))}
              </select>

              <label htmlFor="special-message">
                Leave a special message for each other ❤️
              </label>

              <textarea
                id="special-message"
                value={specialMessage}
                onChange={(e) => setSpecialMessage(e.target.value)}
                placeholder="Something sweet for Priscar..."
                rows="3"
              />

              <p className="weekend-note">
                ♡ Every adventure deserves a memory.
              </p>

              <button
                className="accept-button"
                onClick={saveMemory}
                disabled={isSavingMemory || !memoryDescription.trim()}
              >
                {isSavingMemory
                  ? 'SAVING OUR MEMORY...'
                  : 'SAVE OUR MEMORY ❤️'}
              </button>

            </div>
          </section>
        )}

        {/* OUR MEMORY LANE */}
        <section className="planner-section" id="memory-lane">

          <div className="planner-card">

            <p className="wheel-eyebrow">OUR LITTLE HISTORY</p>

            <h2>Our Memory Lane ❤️</h2>

            <p>Every adventure tells a story.</p>

            {isLoadingMemories ? (
              <p>Loading our memories... ❤️</p>
            ) : memories.length === 0 ? (
              <p>Our memory book is waiting for its first story. ♡</p>
            ) : (

              <div className="memory-list">

                {memories.map((memory) => (

                  <div className="memory-item" key={memory._id}>

                    <h3>{memory.title}</h3>

                    <p>
                      📅 {formatDate(new Date(memory.memoryDate))}
                    </p>

                    <p>{memory.description}</p>

                    {memory.photos && memory.photos.length > 0 && (
                      <div className="memory-photo-gallery">
                        {memory.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`${memory.title} memory ${index + 1}`}
                            className="memory-gallery-photo"
                          />
                        ))}
                      </div>
                    )}

                    <p>⭐ Our rating: {memory.rating}/10</p>

                    {memory.specialMessage && (
                      <p>❤️ {memory.specialMessage}</p>
                    )}

                  </div>

                ))}

              </div>

            )}

          </div>

        </section>

        {/* OUR LOVE NOTES */}
        <section className="planner-section" id="love-notes">

          <div className="planner-card">

            <p className="wheel-eyebrow">LITTLE WORDS OF LOVE</p>

            <h2>Our Love Notes 💌</h2>

            <p>Because some feelings deserve to be written down.</p>

            {/* DISPLAY SAVED LOVE NOTES */}
            <div className="love-notes-list">

              <h3>Our Little Messages ❤️</h3>

              {isLoadingLoveNotes ? (
                <p>Loading our love notes...</p>
              ) : loveNotes.length === 0 ? (
                <p>No love notes yet. Let's write our first one! ♡</p>
              ) : (

                loveNotes.map((note) => (

                  <div className="love-note-item" key={note._id}>

                    <p>💌 From: {note.from}</p>

                    <p>
                      To: {note.to === 'Both' ? 'Both of us' : note.to}
                    </p>

                    <p>{note.message}</p>

                    {note.isSurprise && (
                      <p>🎁 A little surprise!</p>
                    )}

                    <small>
                      {new Date(note.createdAt).toLocaleDateString('en-ZA')}
                    </small>

                  </div>

                ))

              )}

            </div>

            <label htmlFor="love-note-from">From</label>

            <select
              id="love-note-from"
              value={loveNoteFrom}
              onChange={(e) => {
                setLoveNoteFrom(e.target.value);
                setLoveNoteTo(
                  e.target.value === 'Tshepo' ? 'Priscar' : 'Tshepo'
                );
              }}
            >
              <option value="Tshepo">Tshepo</option>
              <option value="Priscar">Priscar</option>
            </select>

            <label htmlFor="love-note-to">To</label>

            <select
              id="love-note-to"
              value={loveNoteTo}
              onChange={(e) => setLoveNoteTo(e.target.value)}
            >
              <option value="Tshepo">Tshepo</option>
              <option value="Priscar">Priscar</option>
              <option value="Both">Both of us</option>
            </select>

            <label htmlFor="love-note-message">
              Write your love note ❤️
            </label>

            <textarea
              id="love-note-message"
              value={loveNoteMessage}
              onChange={(e) => setLoveNoteMessage(e.target.value)}
              placeholder="Write something special..."
              rows="5"
              maxLength="1000"
            />

            <label>
              <input
                type="checkbox"
                checked={isSurprise}
                onChange={(e) => setIsSurprise(e.target.checked)}
              />
              Make this a surprise! 🎁
            </label>

            <button
              className="accept-button"
              onClick={saveLoveNote}
              disabled={isSavingLoveNote || !loveNoteMessage.trim()}
            >
              {isSavingLoveNote ? 'SAVING...' : 'SAVE OUR LOVE NOTE ❤️'}
            </button>

            {loveNoteFeedback && (
              <p className="weekend-note">{loveNoteFeedback}</p>
            )}

          </div>

        </section>

        <footer>
          <span>♡ Our Adventures</span>
          <span>♡ Our Memories</span>
          <span>♡ Our Story</span>
        </footer>

      </div>

    </div>
  );
}

export default App;