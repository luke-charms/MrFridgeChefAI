export interface Recipe {
  title: string;
  cuisine: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  ingredients_used: string[];
  steps: string[];
  tip?: string;
}

export type AppPhase =
  | "idle"          // nothing uploaded yet
  | "uploading"     // image being sent to /analyse
  | "ingredients"   // ingredient list returned, shown to user
  | "generating"    // /recipes call in flight
  | "results"       // recipes ready to display
  | "error";        // something went wrong