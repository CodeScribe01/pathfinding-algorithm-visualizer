import clsx from 'clsx'

/**
 * Thin wrapper around clsx so component call sites stay terse. Tailwind class
 * conflicts are avoided by convention (variants own their own utilities)
 * rather than by pulling in tailwind-merge.
 */
export const cn = (...inputs) => clsx(inputs)

export default cn
