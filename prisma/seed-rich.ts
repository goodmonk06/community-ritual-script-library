import { PrismaClient, RitualType, SegmentType, ScriptStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive seed...')

  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.scriptTag.deleteMany()
  await prisma.ritualTag.deleteMany()
  await prisma.collectionScript.deleteMany()
  await prisma.ritualCollection.deleteMany()
  await prisma.ritualUsageLog.deleteMany()
  await prisma.ritualSnapshot.deleteMany()
  await prisma.ritualScriptVariant.deleteMany()
  await prisma.ritualScriptSegment.deleteMany()
  await prisma.ritualScript.deleteMany()

  // Create tags
  console.log('Creating tags...')
  const moonTag = await prisma.ritualTag.create({
    data: {
      name: 'Moon Cycle',
      slug: 'moon-cycle',
      description: 'Rituals related to lunar cycles',
      color: '#4A5568'
    }
  })

  const meditationTag = await prisma.ritualTag.create({
    data: {
      name: 'Meditation',
      slug: 'meditation',
      description: 'Meditative practices',
      color: '#805AD5'
    }
  })

  const gratitudeTag = await prisma.ritualTag.create({
    data: {
      name: 'Gratitude',
      slug: 'gratitude',
      description: 'Gratitude-focused rituals',
      color: '#38A169'
    }
  })

  const releaseTag = await prisma.ritualTag.create({
    data: {
      name: 'Release & Letting Go',
      slug: 'release',
      description: 'Practices for releasing what no longer serves',
      color: '#E53E3E'
    }
  })

  const intentionTag = await prisma.ritualTag.create({
    data: {
      name: 'Intention Setting',
      slug: 'intention',
      description: 'Setting intentions and manifesting',
      color: '#3182CE'
    }
  })

  const communityTag = await prisma.ritualTag.create({
    data: {
      name: 'Community',
      slug: 'community',
      description: 'Group and community rituals',
      color: '#DD6B20'
    }
  })

  // Create scripts
  console.log('Creating scripts...')

  // 1. New Moon Intention Setting
  const newMoonScript = await prisma.ritualScript.create({
    data: {
      communityId: 'default',
      key: 'new-moon-intention-setting',
      title: 'New Moon Intention Setting Ceremony',
      ritualType: RitualType.new_moon,
      descriptionMarkdown: 'A ceremony for setting intentions during the new moon phase.',
      status: ScriptStatus.published,
      isPublic: true,
      authorId: 'system',
      estimatedDuration: 45,
      segments: {
        create: [
          {
            orderIndex: 0,
            segmentType: SegmentType.opening,
            templateMarkdown: `# Opening Circle\n\nWelcome, dear {{communityName}} family.\n\nTonight we gather {{location}} to honor the new moon - a time of new beginnings.\n\nI'm {{facilitator}}, holding space for our {{groupSize}} circle.`,
            variablesJson: JSON.stringify({
              communityName: 'string',
              location: 'string',
              facilitator: 'string',
              groupSize: 'string'
            })
          },
          {
            orderIndex: 1,
            segmentType: SegmentType.transition,
            templateMarkdown: `# Grounding\n\nLet's take three deep breaths together.\n\nFeel yourself arriving fully in this sacred space.`,
            variablesJson: JSON.stringify({})
          },
          {
            orderIndex: 2,
            segmentType: SegmentType.core,
            templateMarkdown: `# Intention Setting\n\nThe new moon invites us to plant seeds of intention.\n\nReflect: What do you wish to call into your life this lunar cycle?\n\nYou're invited to share your intention with the circle.`,
            variablesJson: JSON.stringify({})
          },
          {
            orderIndex: 3,
            segmentType: SegmentType.blessing,
            templateMarkdown: `# Blessing\n\nMay your intentions take root.\nMay they bloom in perfect timing.\n\nBlessed be.`,
            variablesJson: JSON.stringify({})
          },
          {
            orderIndex: 4,
            segmentType: SegmentType.closing,
            templateMarkdown: `# Closing\n\nThank you, {{communityName}}, for gathering.\n\nOur next gathering: {{nextGathering}}.`,
            variablesJson: JSON.stringify({
              communityName: 'string',
              nextGathering: 'string'
            })
          }
        ]
      },
      variants: {
        create: [
          {
            variantKey: 'online-small',
            conditionsJson: JSON.stringify({ location: 'online', groupSize: 'small' })
          },
          {
            variantKey: 'offline-large',
            conditionsJson: JSON.stringify({ location: 'offline', groupSize: 'large' })
          }
        ]
      }
    }
  })

  // Link tags to newMoonScript
  await prisma.scriptTag.createMany({
    data: [
      { scriptId: newMoonScript.id, tagId: moonTag.id },
      { scriptId: newMoonScript.id, tagId: intentionTag.id },
      { scriptId: newMoonScript.id, tagId: communityTag.id }
    ]
  })

  // 2. Full Moon Release
  const fullMoonScript = await prisma.ritualScript.create({
    data: {
      communityId: 'default',
      key: 'full-moon-release',
      title: 'Full Moon Release Ceremony',
      ritualType: RitualType.full_moon,
      descriptionMarkdown: 'A ceremony for releasing and letting go during the full moon.',
      status: ScriptStatus.published,
      isPublic: true,
      authorId: 'system',
      estimatedDuration: 60,
      segments: {
        create: [
          {
            orderIndex: 0,
            segmentType: SegmentType.opening,
            templateMarkdown: `# Opening\n\nWelcome to our {{communityName}} full moon circle.\n\nThe full moon illuminates what is ready to be released.`,
            variablesJson: JSON.stringify({ communityName: 'string' })
          },
          {
            orderIndex: 1,
            segmentType: SegmentType.core,
            templateMarkdown: `# Release Practice\n\nReflect on what you're ready to release:\n- Old patterns\n- Limiting beliefs\n- What has run its course\n\nWrite down what you're releasing.`,
            variablesJson: JSON.stringify({})
          },
          {
            orderIndex: 2,
            segmentType: SegmentType.blessing,
            templateMarkdown: `# Blessing of Release\n\nMay you release with ease.\nMay you let go with grace.\n\nSo it is.`,
            variablesJson: JSON.stringify({})
          },
          {
            orderIndex: 3,
            segmentType: SegmentType.closing,
            templateMarkdown: `# Closing\n\nThank you for your courage in releasing.\n\nBlessed full moon.`,
            variablesJson: JSON.stringify({})
          }
        ]
      }
    }
  })

  await prisma.scriptTag.createMany({
    data: [
      { scriptId: fullMoonScript.id, tagId: moonTag.id },
      { scriptId: fullMoonScript.id, tagId: releaseTag.id },
      { scriptId: fullMoonScript.id, tagId: communityTag.id }
    ]
  })

  // 3. Daily Morning Practice
  const dailyMorningScript = await prisma.ritualScript.create({
    data: {
      communityId: 'default',
      key: 'daily-morning-practice',
      title: 'Daily Morning Practice',
      ritualType: RitualType.daily,
      descriptionMarkdown: 'A simple morning ritual to start the day.',
      status: ScriptStatus.published,
      isPublic: true,
      authorId: 'system',
      estimatedDuration: 15,
      segments: {
        create: [
          {
            orderIndex: 0,
            segmentType: SegmentType.opening,
            templateMarkdown: `# Good Morning\n\nGood morning, {{userName}}.\n\nToday is {{dayOfWeek}}, {{date}}.`,
            variablesJson: JSON.stringify({
              userName: 'string',
              dayOfWeek: 'string',
              date: 'string'
            })
          },
          {
            orderIndex: 1,
            segmentType: SegmentType.core,
            templateMarkdown: `# Gratitude\n\nName three things you're grateful for:\n\n1. ___\n2. ___\n3. ___`,
            variablesJson: JSON.stringify({})
          },
          {
            orderIndex: 2,
            segmentType: SegmentType.core,
            templateMarkdown: `# Daily Intention\n\nToday, I intend to: _______________`,
            variablesJson: JSON.stringify({})
          },
          {
            orderIndex: 3,
            segmentType: SegmentType.closing,
            templateMarkdown: `# Begin Your Day\n\nStep into this day with presence.\n\nHave a beautiful {{dayOfWeek}}.`,
            variablesJson: JSON.stringify({ dayOfWeek: 'string' })
          }
        ]
      }
    }
  })

  await prisma.scriptTag.createMany({
    data: [
      { scriptId: dailyMorningScript.id, tagId: gratitudeTag.id },
      { scriptId: dailyMorningScript.id, tagId: intentionTag.id }
    ]
  })

  // 4. Gratitude Circle
  const gratitudeCircleScript = await prisma.ritualScript.create({
    data: {
      communityId: 'default',
      key: 'gratitude-circle',
      title: 'Gratitude Circle',
      ritualType: RitualType.other,
      descriptionMarkdown: 'A community practice of sharing gratitude.',
      status: ScriptStatus.published,
      isPublic: true,
      estimatedDuration: 30,
      segments: {
        create: [
          {
            orderIndex: 0,
            segmentType: SegmentType.opening,
            templateMarkdown: `# Opening the Circle\n\nWelcome to our gratitude circle, {{communityName}}.\n\nWe gather to celebrate the abundance in our lives.`,
            variablesJson: JSON.stringify({ communityName: 'string' })
          },
          {
            orderIndex: 1,
            segmentType: SegmentType.core,
            templateMarkdown: `# Sharing Gratitude\n\nTake turns sharing one thing you're grateful for today.\n\nSpeak from the heart.`,
            variablesJson: JSON.stringify({})
          },
          {
            orderIndex: 2,
            segmentType: SegmentType.closing,
            templateMarkdown: `# Closing\n\nMay our gratitude overflow.\n\nThank you for gathering.`,
            variablesJson: JSON.stringify({})
          }
        ]
      }
    }
  })

  await prisma.scriptTag.createMany({
    data: [
      { scriptId: gratitudeCircleScript.id, tagId: gratitudeTag.id },
      { scriptId: gratitudeCircleScript.id, tagId: communityTag.id }
    ]
  })

  // 5. Evening Reflection
  const eveningReflectionScript = await prisma.ritualScript.create({
    data: {
      communityId: 'default',
      key: 'evening-reflection',
      title: 'Evening Reflection',
      ritualType: RitualType.daily,
      descriptionMarkdown: 'An evening practice for reflection and closure.',
      status: ScriptStatus.published,
      isPublic: true,
      estimatedDuration: 10,
      segments: {
        create: [
          {
            orderIndex: 0,
            segmentType: SegmentType.opening,
            templateMarkdown: `# Evening Pause\n\nGood evening, {{userName}}.\n\nLet's reflect on the day that was.`,
            variablesJson: JSON.stringify({ userName: 'string' })
          },
          {
            orderIndex: 1,
            segmentType: SegmentType.core,
            templateMarkdown: `# Reflection Questions\n\n- What brought you joy today?\n- What challenged you?\n- What are you releasing before sleep?`,
            variablesJson: JSON.stringify({})
          },
          {
            orderIndex: 2,
            segmentType: SegmentType.closing,
            templateMarkdown: `# Good Night\n\nRest well, {{userName}}.\n\nTomorrow is a new day.`,
            variablesJson: JSON.stringify({ userName: 'string' })
          }
        ]
      }
    }
  })

  await prisma.scriptTag.createMany({
    data: [
      { scriptId: eveningReflectionScript.id, tagId: meditationTag.id },
      { scriptId: eveningReflectionScript.id, tagId: releaseTag.id }
    ]
  })

  // Continue with more scripts (6-10)...
  // For brevity, I'll create them with less detail

  const meditationScript = await prisma.ritualScript.create({
    data: {
      communityId: 'default',
      key: 'guided-meditation',
      title: 'Guided Meditation',
      ritualType: RitualType.other,
      descriptionMarkdown: 'A simple guided meditation practice.',
      status: ScriptStatus.published,
      isPublic: true,
      estimatedDuration: 20,
      segments: {
        create: [
          {
            orderIndex: 0,
            segmentType: SegmentType.opening,
            templateMarkdown: `# Begin\n\nFind a comfortable position.\n\nClose your eyes.`,
            variablesJson: JSON.stringify({})
          },
          {
            orderIndex: 1,
            segmentType: SegmentType.core,
            templateMarkdown: `# Meditation\n\nFocus on your breath.\n\nInhale... Exhale...\n\nLet thoughts pass like clouds.`,
            variablesJson: JSON.stringify({})
          },
          {
            orderIndex: 2,
            segmentType: SegmentType.closing,
            templateMarkdown: `# Return\n\nSlowly return to the present.\n\nOpen your eyes when ready.`,
            variablesJson: JSON.stringify({})
          }
        ]
      }
    }
  })

  await prisma.scriptTag.create({
    data: { scriptId: meditationScript.id, tagId: meditationTag.id }
  })

  console.log('Created 6 ritual scripts')

  // Create collections
  console.log('Creating collections...')

  const lunarCycleCollection = await prisma.ritualCollection.create({
    data: {
      communityId: 'default',
      key: 'lunar-cycle-complete',
      title: 'Complete Lunar Cycle',
      descriptionMarkdown: 'Full suite of rituals for the entire lunar cycle',
      isPublic: true
    }
  })

  await prisma.collectionScript.createMany({
    data: [
      { collectionId: lunarCycleCollection.id, scriptId: newMoonScript.id, orderIndex: 0 },
      { collectionId: lunarCycleCollection.id, scriptId: fullMoonScript.id, orderIndex: 1 }
    ]
  })

  const dailyPracticesCollection = await prisma.ritualCollection.create({
    data: {
      communityId: 'default',
      key: 'daily-practices',
      title: 'Daily Practices',
      descriptionMarkdown: 'Morning and evening practices for daily grounding',
      isPublic: true
    }
  })

  await prisma.collectionScript.createMany({
    data: [
      { collectionId: dailyPracticesCollection.id, scriptId: dailyMorningScript.id, orderIndex: 0 },
      { collectionId: dailyPracticesCollection.id, scriptId: eveningReflectionScript.id, orderIndex: 1 }
    ]
  })

  console.log('Created 2 collections')

  // Create usage logs
  console.log('Creating usage logs...')

  const now = new Date()
  const usageLogs = []

  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

    usageLogs.push({
      scriptId: [newMoonScript.id, fullMoonScript.id, dailyMorningScript.id][Math.floor(Math.random() * 3)],
      communityId: 'default',
      contextJson: JSON.stringify({
        communityName: 'Sacred Circle',
        facilitator: ['Elena', 'Marcus', 'Sarah'][Math.floor(Math.random() * 3)],
        groupSize: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)],
        location: ['online', 'offline'][Math.floor(Math.random() * 2)]
      }),
      selectedVariant: Math.random() > 0.5 ? 'online-small' : null,
      renderDuration: Math.floor(Math.random() * 100) + 50,
      createdAt
    })
  }

  await prisma.ritualUsageLog.createMany({ data: usageLogs })

  console.log('Created 20 usage logs')

  // Create snapshots
  console.log('Creating snapshots...')

  await prisma.ritualSnapshot.create({
    data: {
      scriptId: newMoonScript.id,
      version: 1,
      title: newMoonScript.title,
      ritualType: newMoonScript.ritualType,
      descriptionMarkdown: newMoonScript.descriptionMarkdown,
      snapshotData: JSON.stringify({ note: 'Initial version' }),
      createdBy: 'system'
    }
  })

  console.log('Created 1 snapshot')

  console.log('✅ Comprehensive seed completed successfully!')
  console.log(`
Summary:
- 6+ Tags created
- 6+ Ritual Scripts created
- 2 Collections created
- 20 Usage Logs created
- 1 Snapshot created
  `)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
