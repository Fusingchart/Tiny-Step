/**
 * Built-in task library and micro-step templates
 * Seeded so app feels useful on first run.
 */

import type { TaskTemplate } from '../types/models';

function t(id: string, name: string, category: TaskTemplate['category'], steps: { text: string; suggestedMinutes?: number }[]): TaskTemplate {
  return {
    id,
    name,
    category,
    microSteps: steps.map((s, i) => ({ ...s, order: i })),
    isBuiltIn: true,
  };
}

export const TEMPLATE_LIBRARY: TaskTemplate[] = [
  // Home
  t('dishes', 'dishes', 'home', [
    { text: 'Clear a small patch of counter.', suggestedMinutes: 1 },
    { text: 'Fill the sink or basin with hot soapy water.', suggestedMinutes: 2 },
    { text: 'Wash 5 items.', suggestedMinutes: 3 },
    { text: 'Take a 2-minute break.', suggestedMinutes: 2 },
    { text: 'Wash 5 more items.', suggestedMinutes: 3 },
    { text: 'Wipe the counters.', suggestedMinutes: 2 },
  ]),
  t('laundry', 'laundry', 'home', [
    { text: 'Gather dirty clothes into one pile.', suggestedMinutes: 2 },
    { text: 'Put one load in the machine.', suggestedMinutes: 2 },
    { text: 'Start the wash.', suggestedMinutes: 1 },
    { text: 'When done, move to dryer or hang.', suggestedMinutes: 3 },
    { text: 'Fold or hang 5 items.', suggestedMinutes: 3 },
    { text: 'Put away what you can.', suggestedMinutes: 2 },
  ]),
  t('vacuuming', 'vacuuming', 'home', [
    { text: 'Get the vacuum out and plug it in.', suggestedMinutes: 1 },
    { text: 'Vacuum one room or one clear path.', suggestedMinutes: 5 },
    { text: 'Take a short break.', suggestedMinutes: 2 },
    { text: 'Do another room or path if you have energy.', suggestedMinutes: 5 },
    { text: 'Put the vacuum away.', suggestedMinutes: 1 },
  ]),
  t('trash', 'trash', 'home', [
    { text: 'Gather trash from one room.', suggestedMinutes: 2 },
    { text: 'Tie the bag and take it out.', suggestedMinutes: 2 },
    { text: 'Put a fresh bag in.', suggestedMinutes: 1 },
  ]),
  t('bathroom reset', 'bathroom reset', 'home', [
    { text: 'Quick wipe of the sink and mirror.', suggestedMinutes: 2 },
    { text: 'Spray toilet and wipe.', suggestedMinutes: 2 },
    { text: 'Replace hand towel if needed.', suggestedMinutes: 1 },
    { text: 'Quick floor sweep if needed.', suggestedMinutes: 2 },
  ]),
  t('declutter', 'declutter one area', 'home', [
    { text: 'Pick one surface (desk, shelf, corner).', suggestedMinutes: 1 },
    { text: 'Remove 5 items that don’t belong.', suggestedMinutes: 2 },
    { text: 'Put them away or in a donate box.', suggestedMinutes: 2 },
    { text: 'Take a breather.', suggestedMinutes: 1 },
  ]),
  t('water plants', 'water plants', 'home', [
    { text: 'Get a jug or watering can.', suggestedMinutes: 1 },
    { text: 'Water 3 plants.', suggestedMinutes: 3 },
    { text: 'Done, or do more if you like.', suggestedMinutes: 1 },
  ]),
  t('fridge check', 'fridge check', 'home', [
    { text: 'Scan for anything obviously expired.', suggestedMinutes: 2 },
    { text: 'Toss one item that’s past it.', suggestedMinutes: 1 },
    { text: 'Wipe one shelf if you have time.', suggestedMinutes: 2 },
  ]),

  // Admin
  t('pay bills', 'pay bills', 'admin', [
    { text: 'Open your bank or bill app.', suggestedMinutes: 1 },
    { text: 'Pay one bill.', suggestedMinutes: 3 },
    { text: 'Take a breather.', suggestedMinutes: 1 },
    { text: 'Pay another if needed.', suggestedMinutes: 3 },
  ]),
  t('sort mail', 'sort mail', 'admin', [
    { text: 'Put mail in one pile.', suggestedMinutes: 1 },
    { text: 'Toss obvious junk.', suggestedMinutes: 2 },
    { text: 'Open one important-looking envelope.', suggestedMinutes: 2 },
    { text: 'Action or file it.', suggestedMinutes: 2 },
  ]),
  t('inbox triage', 'inbox triage', 'admin', [
    { text: 'Archive or delete 5 emails.', suggestedMinutes: 2 },
    { text: 'Reply to one easy email.', suggestedMinutes: 3 },
    { text: 'Flag 2 that need action later.', suggestedMinutes: 1 },
  ]),
  t('expense logging', 'expense logging', 'admin', [
    { text: 'Open your expense app or sheet.', suggestedMinutes: 1 },
    { text: 'Log 3 recent receipts.', suggestedMinutes: 3 },
    { text: 'Done or schedule next batch.', suggestedMinutes: 1 },
  ]),

  // Self-care
  t('shower', 'shower', 'self-care', [
    { text: 'Get a fresh towel and put it in reach.', suggestedMinutes: 1 },
    { text: 'Get in the shower.', suggestedMinutes: 1 },
    { text: 'Do the basics – soap, shampoo, rinse.', suggestedMinutes: 5 },
    { text: 'Dry off and get dressed.', suggestedMinutes: 3 },
  ]),
  t('meds', 'meds', 'self-care', [
    { text: 'Get your meds and a glass of water.', suggestedMinutes: 1 },
    { text: 'Take them.', suggestedMinutes: 1 },
    { text: 'Refill pill organizer if needed.', suggestedMinutes: 2 },
  ]),
  t('stretch', 'stretch', 'self-care', [
    { text: 'Stand up and reach overhead.', suggestedMinutes: 1 },
    { text: 'Touch your toes or calves – no pressure.', suggestedMinutes: 2 },
    { text: 'Roll your shoulders 5 times each way.', suggestedMinutes: 1 },
    { text: 'Take 3 deep breaths.', suggestedMinutes: 1 },
  ]),
  t('quick walk', 'quick walk', 'self-care', [
    { text: 'Put on shoes.', suggestedMinutes: 1 },
    { text: 'Walk to the end of the block.', suggestedMinutes: 3 },
    { text: 'Turn around and come back.', suggestedMinutes: 3 },
  ]),
  t('tidy bedroom', 'tidy bedroom', 'self-care', [
    { text: 'Pick clothes off the floor into one pile.', suggestedMinutes: 2 },
    { text: 'Make the bed – even loosely.', suggestedMinutes: 2 },
    { text: 'Clear nightstand.', suggestedMinutes: 2 },
  ]),

  // Planning
  t('weekly review', 'weekly review', 'planning', [
    { text: 'Open your calendar for the week.', suggestedMinutes: 1 },
    { text: 'Add one thing you’ve been avoiding.', suggestedMinutes: 2 },
    { text: 'Block one break or buffer.', suggestedMinutes: 2 },
    { text: 'Close it. You did the basics.', suggestedMinutes: 1 },
  ]),
  t('meal planning', 'meal planning', 'planning', [
    { text: 'List 3 meals you could make.', suggestedMinutes: 3 },
    { text: 'Check what you already have.', suggestedMinutes: 2 },
    { text: 'Add 3 items to a shopping list.', suggestedMinutes: 2 },
  ]),
  t('calendar check', 'calendar check', 'planning', [
    { text: 'Open your calendar.', suggestedMinutes: 1 },
    { text: 'Review next 3 days.', suggestedMinutes: 2 },
    { text: 'Reschedule or add one item if needed.', suggestedMinutes: 2 },
  ]),
];

/**
 * Quick-add presets for common recurring tasks
 */
export const QUICK_ADD_PRESETS = [
  { label: 'Dishes', templateId: 'dishes' },
  { label: 'Laundry', templateId: 'laundry' },
  { label: 'Trash', templateId: 'trash' },
  { label: 'Meds', templateId: 'meds' },
  { label: 'Inbox', templateId: 'inbox triage' },
  { label: 'Water plants', templateId: 'water plants' },
];
