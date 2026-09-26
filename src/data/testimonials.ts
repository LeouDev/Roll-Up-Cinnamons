/**
 * Customer reviews.
 *
 * PLACEHOLDERS: the Facebook page has 2 reviews, but their text wasn't
 * available when this site was built. Replace each entry with a real review
 * (with the customer's permission) and set `placeholder: false`.
 *
 *   {
 *     quote: 'Soft, warm, and the cookie butter one is a must!',
 *     name: 'Maria S.',
 *     source: 'Facebook review',
 *     rating: 5,            // optional — omit if the review has no rating
 *     placeholder: false,
 *   }
 */
export type Testimonial = {
  quote: string
  name: string
  source?: string
  rating?: 1 | 2 | 3 | 4 | 5
  placeholder: boolean
}

export const testimonials: Testimonial[] = [
  {
    quote: 'Customer review will appear here.',
    name: 'Customer Name',
    source: 'Facebook review',
    placeholder: true,
  },
  {
    quote: 'Customer review will appear here.',
    name: 'Customer Name',
    source: 'Facebook review',
    placeholder: true,
  },
]
