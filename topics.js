// Topic database for Friendly Fire game
// Organized by categories from the game concept

const TOPICS = {
    friendGroup: [
        { text: "Describe our group if we were a type of restaurant.", category: "Friend Group" },
        { text: "What's the one smell that perfectly represents this group?", category: "Friend Group" },
        { text: "If our friend group had a theme song, what would it be?", category: "Friend Group" },
        { text: "What would be the name of our friend group's reality TV show?", category: "Friend Group" },
        { text: "If we were a boy band/girl group, what would our name be?", category: "Friend Group" },
        { text: "What's the most predictable thing this group does every hangout?", category: "Friend Group" },
        { text: "If this friend group was a movie genre, which one would it be?", category: "Friend Group" },
        { text: "What's the unwritten rule everyone in this group follows?", category: "Friend Group" },
        { text: "If we opened a business together, what would go wrong first?", category: "Friend Group" },
        { text: "What's the one thing this group can never agree on?", category: "Friend Group" }
    ],

    nostalgia: [
        { text: "Which 90s trend is each of us secretly still obsessed with?", category: "90s/2000s Nostalgia" },
        { text: "Which friend would've been most likely to get kicked off AOL chat?", category: "90s/2000s Nostalgia" },
        { text: "What's the most embarrassing song we all had on our mix CDs?", category: "90s/2000s Nostalgia" },
        { text: "Which friend would have survived Y2K panic the best?", category: "90s/2000s Nostalgia" },
        { text: "What's the most 90s/2000s thing someone here still owns?", category: "90s/2000s Nostalgia" },
        { text: "Which friend had the worst fashion sense in high school?", category: "90s/2000s Nostalgia" },
        { text: "Who would've been most popular on MySpace and why?", category: "90s/2000s Nostalgia" },
        { text: "What's the cheesiest 90s movie line someone here would definitely quote?", category: "90s/2000s Nostalgia" },
        { text: "Which friend still secretly misses their old Nokia phone?", category: "90s/2000s Nostalgia" },
        { text: "What boy band/girl group did we all pretend not to love?", category: "90s/2000s Nostalgia" }
    ],

    lifeAt50: [
        { text: "What's the most 'we're getting older' moment this group had this month?", category: "Life at 50" },
        { text: "One object everyone here definitely lost and still swears they didn't.", category: "Life at 50" },
        { text: "What's the dad joke capital of this friend group?", category: "Life at 50" },
        { text: "Which friend takes the longest to get ready to leave the house?", category: "Life at 50" },
        { text: "What's the earliest bedtime someone in this group has ever had?", category: "Life at 50" },
        { text: "Who's most likely to fall asleep during movie night?", category: "Life at 50" },
        { text: "What's the most 'old person' complaint someone here has made recently?", category: "Life at 50" },
        { text: "Which friend needs the most help with technology?", category: "Life at 50" },
        { text: "What's the weirdest health remedy someone in this group swears by?", category: "Life at 50" },
        { text: "Who takes the most pictures of their food before eating?", category: "Life at 50" }
    ],

    hypotheticals: [
        { text: "Which friend would survive longest in a zombie apocalypse—and why?", category: "Hypotheticals" },
        { text: "If we formed a band today, what would the name be?", category: "Hypotheticals" },
        { text: "If this group was stranded on an island, who would be eaten first?", category: "Hypotheticals" },
        { text: "Which friend would become famous and for what ridiculous reason?", category: "Hypotheticals" },
        { text: "If we were all in a heist movie, what role would each person have?", category: "Hypotheticals" },
        { text: "Who would win in a dance battle and what would their signature move be?", category: "Hypotheticals" },
        { text: "If we were characters in a sitcom, who would be the quirky neighbor?", category: "Hypotheticals" },
        { text: "Which friend would be the first to get voted off a reality show?", category: "Hypotheticals" },
        { text: "If we opened a restaurant, what would be our signature disaster dish?", category: "Hypotheticals" },
        { text: "Who would survive the longest in a haunted house?", category: "Hypotheticals" }
    ],

    personalities: [
        { text: "What would [Name]'s TED talk be about?", category: "Playful Personalities" },
        { text: "If [Name] was a smartphone app, which one would they be?", category: "Playful Personalities" },
        { text: "Describe [Name]'s dream job (be kind-ish).", category: "Playful Personalities" },
        { text: "What's the most on-brand thing [Name] would do on vacation?", category: "Playful Personalities" },
        { text: "If [Name] had a catchphrase, what would it be?", category: "Playful Personalities" },
        { text: "What's [Name]'s secret superpower that nobody talks about?", category: "Playful Personalities" },
        { text: "If [Name] wrote an autobiography, what would the title be?", category: "Playful Personalities" },
        { text: "What's the weirdest compliment you could give [Name]?", category: "Playful Personalities" },
        { text: "If [Name] was a character in a video game, what would their special ability be?", category: "Playful Personalities" },
        { text: "What emoji perfectly represents [Name]'s personality?", category: "Playful Personalities" }
    ],

    generational: [
        { text: "What's something our teenage selves would roast us for now?", category: "Generational Humor" },
        { text: "What's the most 'millennial/Gen X' thing someone here does?", category: "Generational Humor" },
        { text: "Which friend is most likely to say 'back in my day...'?", category: "Generational Humor" },
        { text: "What's the biggest technology struggle someone here has faced?", category: "Generational Humor" },
        { text: "Who still uses Facebook the most and why is it adorable?", category: "Generational Humor" },
        { text: "What's the most outdated slang someone here still uses?", category: "Generational Humor" },
        { text: "Which friend would be the worst at explaining TikTok to their parents?", category: "Generational Humor" },
        { text: "What's the oldest piece of technology someone here refuses to replace?", category: "Generational Humor" },
        { text: "Who's most likely to forward a chain email?", category: "Generational Humor" },
        { text: "What's the most 'uncool parent' thing someone in this group has done?", category: "Generational Humor" }
    ],

    quirksAndHabits: [
        { text: "What's the weirdest food combination someone here actually enjoys?", category: "Quirks & Habits" },
        { text: "Who has the most bizarre morning routine?", category: "Quirks & Habits" },
        { text: "What's the most unnecessary thing someone here collects?", category: "Quirks & Habits" },
        { text: "Which friend has the messiest car and what's the weirdest thing in it?", category: "Quirks & Habits" },
        { text: "What's the strangest thing someone here does when they think nobody's watching?", category: "Quirks & Habits" },
        { text: "Who takes the longest to respond to texts and what's their excuse?", category: "Quirks & Habits" },
        { text: "What's the most predictable order someone always gets at restaurants?", category: "Quirks & Habits" },
        { text: "Which friend has the most tabs open on their browser right now?", category: "Quirks & Habits" },
        { text: "Who's most likely to have a full conversation with their pet?", category: "Quirks & Habits" },
        { text: "What's the weirdest thing someone here is unreasonably good at?", category: "Quirks & Habits" }
    ],

    sharedMemories: [
        { text: "What's the most chaotic group outing we've ever had?", category: "Shared Memories" },
        { text: "Which friend has told the same story the most times?", category: "Shared Memories" },
        { text: "What's the funniest misunderstanding this group has ever had?", category: "Shared Memories" },
        { text: "Which inside joke has lasted the longest and makes the least sense?", category: "Shared Memories" },
        { text: "What's the worst group photo we've ever taken?", category: "Shared Memories" },
        { text: "Who always gets lost when we go somewhere new?", category: "Shared Memories" },
        { text: "What's the most embarrassing thing that happened to someone in front of the group?", category: "Shared Memories" },
        { text: "Which friend is always late and what's their best excuse?", category: "Shared Memories" },
        { text: "What's the weirdest tradition this group has accidentally created?", category: "Shared Memories" },
        { text: "Who's the designated photographer who takes 100 photos of the same thing?", category: "Shared Memories" }
    ]
};

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TOPICS;
}
