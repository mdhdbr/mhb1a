import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// This is intentionally left empty. The data will be populated from the JSON file.
// We are leaving it as an empty array to satisfy the type checker.
export const PlaceHolderImages: ImagePlaceholder[] = [];
