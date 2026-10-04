/* ==========================================================================
   SOULSPACE — SPIRITUAL REFLECTION JAVASCRIPT
   Robust filtering, accessible modal dialogues, and independent content data
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    initModal();
});

/* ==========================================================================
   CONTENT DATA REPOSITORY
   Completely distinct and independent data structures per category:
   - Stories (s1 - s3)
   - Gita Slokas (g1 - g3)
   - Life Lessons (l1 - l6)
   ========================================================================== */

const SPIRITUAL_DATA = {
    /* ----------------------------------------------------
       STORIES
       ---------------------------------------------------- */
    s1: {
        type: 'story',
        title: 'The Kindness of Lord Krishna',
        image: 'images/story_krishna.jpg',
        badge: 'Story',
        paragraphs: [
            'Once, a humble devotee named Vidura lived in a simple hut. When Lord Krishna visited Hastinapura, the wealthy royal courtiers prepared opulent feasts in grand palaces, hoping to impress the Lord with their magnificence and status.',
            'Krishna politely declined all their lavish invitations and walked quietly to the modest home of Vidura. Overwhelmed with pure love and devotion, Vidura’s wife welcomed Krishna. In her state of ecstatic love, she was so absorbed in gazing upon the Lord that she offered him simple fruit peels while discarding the fruit itself.',
            'Krishna smiled with profound gentleness and ate the humble offering with greater joy than any royal banquet could ever bring. When asked why, Krishna revealed that the divine is never moved by wealth, pride, or grandeur — but only by the purity and love within the heart.',
            'True devotion is an offering of the soul, where even the simplest gesture carries the weight of eternity.'
        ],
        moral: 'Moral: Love and sincerity are infinitely more valuable than material wealth.'
    },

    s2: {
        type: 'story',
        title: 'The Disciple and the River',
        image: 'images/story_disciple.jpg',
        badge: 'Story',
        paragraphs: [
            'A young disciple once sat beside a rushing mountain river with his guru. Troubled by repeated obstacles and failures in his spiritual journey, he asked with a heavy heart, "Master, what is the true meaning of life, and how do I overcome the hardships in my way?"',
            'The guru smiled, pointed towards the clear mountain torrent, and answered softly: "Observe the river carefully. When massive boulders block its course, does the river argue with the stone? Does it turn back in defeat or rage against the landscape?"',
            '"No," the guru continued. "The river simply yields, curves around the rocks, carves through deep canyons, and never ceases flowing forward until it merges with the boundless ocean of truth."',
            'In life, difficulties are not walls meant to stop you; they are stones that shape your flow. Keep faith, stay humble, and keep moving forward.'
        ],
        moral: 'Moral: Keep moving forward with faith, even when the path is difficult.'
    },

    s3: {
        type: 'story',
        title: 'The Elephant and the Sage',
        image: 'images/story_elephant.jpg',
        badge: 'Story',
        paragraphs: [
            'Deep inside an ancient forest, a sage sat in profound meditation beneath the sheltering boughs of a great banyan tree. Animals of all kinds lived around him in complete peace, sensing the aura of unconditional harmlessness that emanated from his stillness.',
            'One day, a mighty bull elephant, wild with pride and undisputed physical strength, charged through the grove, tearing branches and seeking to intimidate the quiet hermit.',
            'The sage slowly opened his eyes. In his steady gaze was neither fear nor anger, but boundless compassion and quiet poise. He gently whispered, "True strength is not measured in physical power to destroy, but in the mastery of self-control and inner peace."',
            'Hearing those calm words, the elephant paused, felt the quiet majesty of self-restraint, and gently knelt before the sage in quiet reverence. Real strength is never aggressive — it is quiet, patient, and invincible.'
        ],
        moral: 'Moral: Real strength lies in humility and self-control.'
    },

    /* ----------------------------------------------------
       BHAGAVAD GITA SLOKAS
       ---------------------------------------------------- */
    g1: {
        type: 'sloka',
        title: 'Karmanye vadhikaraste ma phaleshu kadachana',
        sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥',
        ref: 'Bhagavad Gita — Chapter 2, Verse 47',
        translation: 'You have the right to perform your prescribed duty, but you are not entitled to the fruits of your actions. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.',
        commentary: [
            'This verse represents the eternal cornerstone of Karma Yoga — the path of selfless and dedicated action. Lord Krishna teaches Arjuna that true peace of mind is found when we separate our effort from the anxiety of outcomes.',
            'When our focus is consumed by what we will gain or lose, our actions become clouded with worry, fear, and desire. But when action is performed purely as an offering, with utmost focus and surrender, work itself becomes meditation.',
            'Give your best to every moment, and let life unfold the results in divine timing.'
        ]
    },

    g2: {
        type: 'sloka',
        title: 'Yada yada hi dharmasya glani bhavati bharata',
        sanskrit: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत ।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥',
        ref: 'Bhagavad Gita — Chapter 4, Verse 7',
        translation: 'Whenever and wherever there is a decline in righteousness, O descendant of Bharata, and a predominant rise of unrighteousness — at that time I manifest Myself on earth.',
        commentary: [
            'This famous verse provides timeless assurance that cosmic harmony and divine truth will always prevail over chaos and despair.',
            'Whenever injustice and darkness appear overwhelming in the world or in the human heart, divine wisdom awakens to restore balance, truth, and peace.',
            'It is a sacred reminder that no matter how difficult times may become, light always returns. We are called to stand on the side of truth and righteousness, trusting in cosmic justice.'
        ]
    },

    g3: {
        type: 'sloka',
        title: 'Manmana bhava madbhakto mad-yaji mam namaskuru',
        sanskrit: 'मन्मना भव मद्भक्तो मद्याजी मां नमस्कुरु ।\nमामेवैष्यसि सत्यं ते प्रतिजाने प्रियोऽसि मे ॥',
        ref: 'Bhagavad Gita — Chapter 18, Verse 65',
        translation: 'Always think of Me, become My devotee, worship Me, and offer your homage unto Me. Thus you will come to Me without fail. I promise you this, for you are dearly beloved to Me.',
        commentary: [
            'As the dialogue of the Gita reaches its climax in the 18th Chapter, Krishna shares this most intimate and comforting assurance with Arjuna.',
            'It is a promise of unconditional love and protection. The Lord asks not for rigid ritualism or intellectual complexity, but for simple remembrance, devotion, and a heart open to grace.',
            'Whenever the mind feels scattered or overwhelmed by the world, turning inward to the divine source brings immediate serenity and refuge.'
        ]
    },

    /* ----------------------------------------------------
       LIFE LESSONS
       Independent reflections on mindful daily living
       ---------------------------------------------------- */
    l1: {
        type: 'lesson',
        title: 'The Power of Patience',
        quote: 'Not everything needs to happen immediately. Some things need time to grow.',
        reflection: [
            'In a modern culture that prioritises instant speed and immediate answers, patience has become a rare and sacred virtue. We plant a seed and expect flowers by evening, forgetting that the most profound creations of nature take quiet seasons beneath the earth.',
            'True patience is not passive resignation; it is active faith in the process of life. It is the wisdom to know that timing is as essential as effort.',
            'Give your dreams time to take root. Be gentle with yourself in seasons of quiet waiting. What is truly meant for your soul will bloom at the perfect hour.'
        ]
    },

    l2: {
        type: 'lesson',
        title: 'Letting Go',
        quote: 'Peace often begins when we stop holding on to things we cannot control.',
        reflection: [
            'So much of our emotional fatigue comes not from current reality, but from gripping tightly onto what was or trying to control what will be.',
            'Letting go does not mean you stop caring; it means you realise that some things were never yours to carry. When you unclench your hands and release your expectations of people and outcomes, you create space for peace to settle in.',
            'Trust the wisdom of release. Surrender is not surrender of effort, but surrender of unnecessary burden.'
        ]
    },

    l3: {
        type: 'lesson',
        title: 'Choose Kindness',
        quote: 'A small act of kindness can change someone’s entire day.',
        reflection: [
            'You may never know the quiet battles fought by the people you cross paths with each day. A gentle word, an attentive ear, or a warm smile costs nothing, yet carries the power to heal an aching heart.',
            'Kindness is never wasted. Even when unnoticed or unappreciated, every kind action leaves an imprint upon your own character and softens the world around you.',
            'Be the calm in someone else’s storm. Let your presence be a blessing wherever you go.'
        ]
    },

    l4: {
        type: 'lesson',
        title: 'Accept Yourself',
        quote: 'You do not have to be perfect to be worthy of peace and happiness.',
        reflection: [
            'We spend years measuring our worth against unrealistic standards and comparing our internal struggles with other people’s external highlights.',
            'Acceptance is the fertile soil from which genuine growth springs. Embrace your quirks, honour your scars, and forgive yourself for past mistakes. You are a work in progress, learning and evolving each day.',
            'Peace begins the moment you stop demanding perfection from yourself and start offering yourself grace.'
        ]
    },

    l5: {
        type: 'lesson',
        title: 'Start Again',
        quote: 'Every morning gives you another opportunity to begin.',
        reflection: [
            'Yesterday’s missteps do not have to dictate today’s possibilities. The dawn does not ask about yesterday’s darkness; it simply rises and bathes the world in new light.',
            'There is no limit to how many times you can begin anew. Take the lesson, forgive the past, release the regret, and take one small positive step forward.',
            'Every sunrise is a fresh page. Write today with hope and intentionality.'
        ]
    },

    l6: {
        type: 'lesson',
        title: 'Be Present',
        quote: 'Peace becomes easier to find when we stop living constantly in the past or future.',
        reflection: [
            'The mind is often an eager time-traveller, dwelling in nostalgia or worrying about tomorrow. But life is never lived in memories or anticipations — life only ever exists right now.',
            'The breath you are taking, the air upon your skin, the silence between your thoughts — this present moment is the only place where true peace can be experienced.',
            'Whenever you feel overwhelmed, bring your awareness gently back to the here and now. This moment is sufficient.'
        ]
    }
};

/* ==========================================================================
   FILTER TABS LOGIC
   Strict filtering: ALL = everything, STORIES = stories, SLOKAS = slokas, LESSONS = lessons
   ========================================================================== */

function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.dataset.filter;

            // Update button active state & accessibility
            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });

            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            // Apply filter value to document.body attribute
            document.body.setAttribute('data-filter', filterValue);
        });
    });
}

/* ==========================================================================
   MODAL DIALOG IMPLEMENTATION
   ========================================================================== */

function initModal() {
    const backdrop = document.getElementById('modal-backdrop');
    const closeBtn = document.getElementById('modal-close');
    const contentContainer = document.getElementById('modal-content');

    if (!backdrop || !closeBtn || !contentContainer) return;

    // Attach click listeners to all cards and arrow buttons
    const cards = document.querySelectorAll('.content-card[data-id]');
    cards.forEach(card => {
        const id = card.dataset.id;
        const arrowBtn = card.querySelector('.action-arrow-btn');

        // Card click handler
        card.addEventListener('click', (e) => {
            // Prevent double triggers if arrow button was directly clicked
            openItemModal(id);
        });

        // Ensure button click triggers cleanly
        if (arrowBtn) {
            arrowBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openItemModal(id);
            });
        }
    });

    // Close on button click
    closeBtn.addEventListener('click', closeModal);

    // Close on backdrop click (outside the dialog)
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            closeModal();
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop.classList.contains('open')) {
            closeModal();
        }
    });

    function openItemModal(id) {
        const item = SPIRITUAL_DATA[id];
        if (!item) return;

        let htmlContent = '';

        if (item.type === 'story') {
            htmlContent = `
                <img src="${item.image}" alt="${item.title}" class="modal-story-img" loading="lazy">
                <span class="category-badge badge-story" style="margin-bottom: 12px; display: inline-flex;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width:12px; height:12px; margin-right:4px;">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    ${item.badge}
                </span>
                <h2 class="modal-title">${item.title}</h2>
                ${item.paragraphs.map(p => `<p class="modal-paragraph">${p}</p>`).join('')}
                <div class="modal-moral-highlight">
                    ${item.moral}
                </div>
            `;
        } else if (item.type === 'sloka') {
            htmlContent = `
                <div class="gita-badge" style="margin-bottom: 14px;">
                    <span class="om-text" style="font-size: 16px;">ॐ</span>
                    <span style="font-size: 13px;">Bhagavad Gita</span>
                </div>
                <h2 class="modal-title">${item.title}</h2>
                <div class="modal-sanskrit-box">
                    <p class="modal-sanskrit-text">${item.sanskrit.replace(/\n/g, '<br>')}</p>
                    <span class="modal-reference-tag">${item.ref}</span>
                </div>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--c-forest-800); margin-bottom: 8px;">English Translation:</h4>
                <p class="modal-paragraph" style="font-style: italic; color: var(--c-text-sub);">${item.translation}</p>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--c-forest-800); margin: 18px 0 8px;">Philosophical Commentary:</h4>
                ${item.commentary.map(c => `<p class="modal-paragraph">${c}</p>`).join('')}
            `;
        } else if (item.type === 'lesson') {
            htmlContent = `
                <span class="category-badge badge-lesson" style="margin-bottom: 14px; display: inline-flex;">
                    <svg viewBox="0 0 24 24" fill="currentColor" style="width:12px; height:12px; margin-right:4px;">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    Life Lesson
                </span>
                <h2 class="modal-title">${item.title}</h2>
                <div class="modal-lesson-quote">&ldquo;${item.quote}&rdquo;</div>
                ${item.reflection.map(r => `<p class="modal-paragraph">${r}</p>`).join('')}
            `;
        }

        contentContainer.innerHTML = htmlContent;
        backdrop.classList.add('open');
        backdrop.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        backdrop.classList.remove('open');
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}
