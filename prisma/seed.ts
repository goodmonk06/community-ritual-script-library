import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clear existing data
  await prisma.ritualScriptVariant.deleteMany()
  await prisma.ritualScriptSegment.deleteMany()
  await prisma.ritualScript.deleteMany()

  // Seed 1: New Moon Intention Setting
  const newMoonScript = await prisma.ritualScript.create({
    data: {
      communityId: 'default',
      key: 'new-moon-intention-setting',
      title: 'New Moon Intention Setting Ceremony',
      ritualType: 'new_moon',
      descriptionMarkdown: 'A ceremony for setting intentions during the new moon phase. Supports both online and offline gatherings.',
    }
  })

  await prisma.ritualScriptSegment.createMany({
    data: [
      {
        scriptId: newMoonScript.id,
        orderIndex: 0,
        segmentType: 'opening',
        templateMarkdown: `# Opening Circle

Welcome, dear {{communityName}} family.

Tonight we gather {{location}} to honor the new moon - a time of new beginnings, fresh starts, and planting seeds for the cycle ahead.

I'm {{facilitator}}, and I'm honored to hold space for our {{groupSize}} circle tonight.`,
        variablesJson: JSON.stringify({
          communityName: 'string',
          location: 'online|offline',
          facilitator: 'string',
          groupSize: 'small|medium|large'
        })
      },
      {
        scriptId: newMoonScript.id,
        orderIndex: 1,
        segmentType: 'transition',
        templateMarkdown: `# Grounding

Let's begin by taking three deep breaths together.

{{breathingInstruction}}

Feel yourself arriving fully in this sacred space.`,
        variablesJson: JSON.stringify({
          breathingInstruction: 'string'
        })
      },
      {
        scriptId: newMoonScript.id,
        orderIndex: 2,
        segmentType: 'core',
        templateMarkdown: `# Intention Setting

The new moon invites us to plant seeds of intention.

Take a moment to reflect:
- What do you wish to call into your life this lunar cycle?
- What seeds are you ready to plant?
- What new chapter is beginning for you?

{{reflectionTime}}

When you're ready, you're invited to share your intention with the circle.`,
        variablesJson: JSON.stringify({
          reflectionTime: 'string'
        })
      },
      {
        scriptId: newMoonScript.id,
        orderIndex: 3,
        segmentType: 'blessing',
        templateMarkdown: `# Blessing

May your intentions take root.
May they be nourished by your actions.
May they bloom in perfect timing.

Blessed be.`,
        variablesJson: JSON.stringify({})
      },
      {
        scriptId: newMoonScript.id,
        orderIndex: 4,
        segmentType: 'closing',
        templateMarkdown: `# Closing

Thank you, {{communityName}}, for gathering with open hearts.

Our next gathering will be {{nextGathering}}.

Until then, tend to your intentions with love.`,
        variablesJson: JSON.stringify({
          communityName: 'string',
          nextGathering: 'string'
        })
      }
    ]
  })

  await prisma.ritualScriptVariant.createMany({
    data: [
      {
        scriptId: newMoonScript.id,
        variantKey: 'online-small',
        conditionsJson: JSON.stringify({
          location: 'online',
          groupSize: 'small'
        })
      },
      {
        scriptId: newMoonScript.id,
        variantKey: 'offline-large',
        conditionsJson: JSON.stringify({
          location: 'offline',
          groupSize: 'large'
        })
      }
    ]
  })

  console.log('Created New Moon script with 5 segments and 2 variants')

  // Seed 2: Full Moon Release
  const fullMoonScript = await prisma.ritualScript.create({
    data: {
      communityId: 'default',
      key: 'full-moon-release',
      title: 'Full Moon Release Ceremony',
      ritualType: 'full_moon',
      descriptionMarkdown: 'A ceremony for releasing and letting go during the full moon. Includes burning ritual for in-person gatherings.',
    }
  })

  await prisma.ritualScriptSegment.createMany({
    data: [
      {
        scriptId: fullMoonScript.id,
        orderIndex: 0,
        segmentType: 'opening',
        templateMarkdown: `# Opening Circle

Welcome to our {{communityName}} full moon circle.

The full moon illuminates what is ready to be released. She shines her light on what no longer serves us, inviting us to let go with gratitude.

Facilitated by {{facilitator}}, we gather as {{groupSize}} hearts.`,
        variablesJson: JSON.stringify({
          communityName: 'string',
          facilitator: 'string',
          groupSize: 'small|medium|large'
        })
      },
      {
        scriptId: fullMoonScript.id,
        orderIndex: 1,
        segmentType: 'core',
        templateMarkdown: `# Release Practice

Take a moment to reflect on what you're ready to release:
- Old patterns that no longer serve
- Limiting beliefs
- Relationships or situations that have run their course

Write down what you're releasing. {{releaseInstruction}}

As you release, say silently or aloud: "I release this with love and gratitude."`,
        variablesJson: JSON.stringify({
          releaseInstruction: 'string'
        })
      },
      {
        scriptId: fullMoonScript.id,
        orderIndex: 2,
        segmentType: 'blessing',
        templateMarkdown: `# Blessing of Release

May you release with ease.
May you let go with grace.
May you make space for what wants to emerge.

So it is.`,
        variablesJson: JSON.stringify({})
      },
      {
        scriptId: fullMoonScript.id,
        orderIndex: 3,
        segmentType: 'closing',
        templateMarkdown: `# Closing

Thank you, {{communityName}}, for your courage in releasing.

Remember: letting go creates space for new blessings to arrive.

Blessed full moon to you all.`,
        variablesJson: JSON.stringify({
          communityName: 'string'
        })
      }
    ]
  })

  await prisma.ritualScriptVariant.createMany({
    data: [
      {
        scriptId: fullMoonScript.id,
        variantKey: 'offline',
        conditionsJson: JSON.stringify({
          location: 'offline'
        })
      },
      {
        scriptId: fullMoonScript.id,
        variantKey: 'online',
        conditionsJson: JSON.stringify({
          location: 'online'
        })
      }
    ]
  })

  console.log('Created Full Moon script with 4 segments and 2 variants')

  // Seed 3: Daily Morning Practice
  const dailyScript = await prisma.ritualScript.create({
    data: {
      communityId: 'default',
      key: 'daily-morning-practice',
      title: 'Daily Morning Practice',
      ritualType: 'daily',
      descriptionMarkdown: 'A simple morning ritual to start the day with intention and presence.',
    }
  })

  await prisma.ritualScriptSegment.createMany({
    data: [
      {
        scriptId: dailyScript.id,
        orderIndex: 0,
        segmentType: 'opening',
        templateMarkdown: `# Good Morning

Good morning, {{userName}}.

Today is {{dayOfWeek}}, {{date}}.

Take a deep breath and arrive in this new day.`,
        variablesJson: JSON.stringify({
          userName: 'string',
          dayOfWeek: 'string',
          date: 'string'
        })
      },
      {
        scriptId: dailyScript.id,
        orderIndex: 1,
        segmentType: 'core',
        templateMarkdown: `# Gratitude Practice

Name three things you're grateful for this morning:

1. _______________
2. _______________
3. _______________

Let gratitude fill your heart.`,
        variablesJson: JSON.stringify({})
      },
      {
        scriptId: dailyScript.id,
        orderIndex: 2,
        segmentType: 'core',
        templateMarkdown: `# Daily Intention

What is your intention for today?

{{intentionPrompt}}

Speak or write your intention:

"Today, I intend to _________________"`,
        variablesJson: JSON.stringify({
          intentionPrompt: 'string'
        })
      },
      {
        scriptId: dailyScript.id,
        orderIndex: 3,
        segmentType: 'closing',
        templateMarkdown: `# Begin Your Day

You are ready.

Step into this day with presence, purpose, and peace.

Have a beautiful {{dayOfWeek}}, {{userName}}.`,
        variablesJson: JSON.stringify({
          dayOfWeek: 'string',
          userName: 'string'
        })
      }
    ]
  })

  console.log('Created Daily Morning script with 4 segments')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
