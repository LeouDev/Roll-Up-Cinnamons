/**
 * Website copy. Kept here so wording can change without touching layout code.
 * Only facts from the bakery's Facebook page are stated as facts; the rest is
 * brand language ("rolled with love") or clearly marked PLACEHOLDER.
 */
import type { ImageId } from './images.generated'

export const hero = {
  eyebrow: 'Homemade cinnamon rolls · Lapu-Lapu City',
  titleLead: 'Soft. Warm.',
  titleAccent: 'Rolled with love.',
  subtitle: "Homemade cinnamon rolls packed with flavors you'll want to come back for.",
  primaryCta: 'Order now',
  secondaryCta: 'Explore the menu',
  image: 'box-trio' as ImageId,
  imageAlt: 'Three homemade cinnamon rolls in a kraft box — one with chocolate cookie crumbs, one with a creamy frosting swirl, one with biscuit crumble',
  secondaryImage: 'plate-single' as ImageId,
  secondaryImageAlt: 'A cinnamon roll with biscuit crumble on a plate',
  stamp: 'Homemade · Soft cinnamon rolls · Est. 2026 · ',
}

export const marquee = ['Homemade cinnamon rolls', 'Box of 4 — your flavors', 'Soft cheese rolls', 'Lapu-Lapu City']

export const menuIntro = {
  eyebrow: 'The menu',
  title: 'Fresh From The Oven',
  subtitle: 'Simple ingredients. Soft rolls. Big flavor.',
}

export const builderIntro = {
  eyebrow: 'Box of 4',
  title: 'Build your box',
  subtitle: 'Four rolls. Your favorites. One box.',
  note: 'pick any four!',
}

export type Benefit = { title: string; text: string; icon: 'home' | 'fresh' | 'flavor' | 'love' }

export const whyRollUp = {
  eyebrow: 'Why Roll Up',
  title: 'Homemade, the way it should taste.',
  benefits: [
    { icon: 'home', title: 'Homemade', text: 'Soft cinnamon rolls made the home-bakery way.' },
    { icon: 'fresh', title: 'Fresh', text: 'Made for our customers — not mass-produced for a shelf.' },
    { icon: 'flavor', title: 'Flavorful', text: 'A variety of flavors and toppings. Mix them in one box.' },
    { icon: 'love', title: 'Made with love', text: 'Every swirl is rolled with love. That’s the Roll Up way.' },
  ] satisfies Benefit[],
}

export const galleryIntro = {
  eyebrow: 'Gallery',
  title: 'A peek inside the box',
  subtitle: 'Straight from our Facebook page — real rolls, real boxes.',
}

export const about = {
  eyebrow: 'Our story',
  title: 'A little bit about Roll Up',
  paragraphs: [
    'Roll Up Cinnamons is a local home bakery in Babag 2, Lapu-Lapu City, making soft homemade cinnamon rolls packed with a variety of flavors — and soft cheese rolls, too.',
    'Pick your favorite flavors, fill a box of four, and send us a message. We’ll take it from there.',
  ],
  /**
   * PLACEHOLDER — a short personal note from the baker (how Roll Up started,
   * what they love about baking). Shown as a quote when filled in.
   */
  founderNote: '',
  /** PLACEHOLDER — who the note is from, e.g. 'Ana, the baker behind Roll Up'. */
  founderName: '',
  signOff: 'est. 2026',
  image: 'logo-kraft-square' as ImageId,
  imageAlt: 'The original Roll Up Cinnamon logo on crumpled kraft paper, est. 2026',
  photo: 'detail-classic-swirl' as ImageId,
  photoAlt: 'Two frosted cinnamon rolls with visible cinnamon swirls, seen from above',
}

export const testimonialsIntro = {
  eyebrow: 'Kind words',
  title: 'What people are saying',
}

export const locationIntro = {
  eyebrow: 'Visit & contact',
  title: 'Find your way to Roll Up',
  orderNote: 'Orders are taken through our Facebook page — send us a message on Messenger.',
  hoursFallback: 'Message us to check today’s availability.',
}

export const finalCta = {
  title: 'Ready to roll?',
  subtitle: 'Pick your flavors and build your box.',
  cta: 'Order now',
}
