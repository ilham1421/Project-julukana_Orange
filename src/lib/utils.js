import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

/**
 * 
 * @param {"A" | "B" | "C" | "D"} answer 
 */
export function convertAnswerToNumber(answer) {
	switch (answer) {
		case 'A':
			return 0;
		case 'B':
			return 1;
		case 'C':
			return 2;
		case 'D':
			return 3;
		default:
			return null; // or throw an error if needed
	}
}