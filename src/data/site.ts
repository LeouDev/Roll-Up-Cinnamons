/**
 * Business details — the single source of truth for everything the site says
 * about Roll Up Cinnamons.
 *
 * Everything below is taken from the bakery's Facebook page. Anything that
 * page does not state is `null` / empty and marked PLACEHOLDER; the site hides
 * or softens those spots until you fill them in.
 */

const FACEBOOK_PAGE_ID = '61594842145810'

export const site = {
  name: 'Roll Up Cinnamons',
  shortName: 'Roll Up',
  /** Facebook intro, word for word. */
  tagline: 'Homemade soft cinnamon rolls, packed with variety of flavors.',
  category: 'Bakery',
  /** From the logo ("est. 2026"). */
  established: 2026,

  address: {
    area: 'Babag 2',
    city: 'Lapu-Lapu City',
    country: 'Philippines',
    countryCode: 'PH',
    postalCode: '6015',
  },

  links: {
    facebook: `https://www.facebook.com/profile.php?id=${FACEBOOK_PAGE_ID}`,
    facebookReviews: `https://www.facebook.com/profile.php?id=${FACEBOOK_PAGE_ID}&sk=reviews`,
    /**
     * Messenger chat with the page. VERIFY once: open it on a phone and
     * confirm it starts a chat with Roll Up Cinnamons. If the page gets a
     * username later, switch to https://m.me/<username>.
     */
    messenger: `https://m.me/${FACEBOOK_PAGE_ID}`,
    /** Opens Google Maps on the barangay. Swap for the exact pin when ready. */
    directions:
      'https://www.google.com/maps/search/?api=1&query=Babag%202%2C%20Lapu-Lapu%20City%2C%20Philippines%206015',
  },

  /** PLACEHOLDER — not listed on the Facebook page. Leave null to hide. */
  phone: null as string | null,
  /** PLACEHOLDER — not listed on the Facebook page. Leave null to hide. */
  email: null as string | null,
  /**
   * PLACEHOLDER — Facebook shows opening hours exist ("Closed now") but not
   * what they are. Example: [{ days: 'Mon – Sat', time: '9:00 AM – 6:00 PM' }]
   */
  hours: [] as { days: string; time: string }[],

  /**
   * The live address (the bare domain redirects here). Used for the
   * canonical URL, social previews and structured data.
   */
  url: 'https://www.rollup-cinnamon.online',
} as const

export type NavItem = { label: string; href: string }

/** Main navigation. Hash links today; swap for routes when pages are added. */
export const navigation: NavItem[] = [
  { label: 'Home', href: '#top' },
  { label: 'Menu', href: '#menu' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]

export const formatAddress = (a = site.address) => `${a.area}, ${a.city}, ${a.country} ${a.postalCode}`
