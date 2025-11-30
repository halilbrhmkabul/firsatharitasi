import { Store } from '../types';

export type RootStackParamList = {
  MainTabs: undefined;
  Auth: undefined;
  StoreDetail: { store: Store };
};

export type MainTabsParamList = {
  Map: undefined;
  Explore: undefined;
  Profile: undefined;
};
