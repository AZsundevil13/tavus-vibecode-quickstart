import { atom } from "jotai";
import { config } from "@/config/environment";
import { logger } from "@/utils/logger";
import { SecurityUtils } from "@/utils/security";

// Get initial token from localStorage or use environment config
const getInitialToken = (): string | null => {
  try {
    const savedToken = localStorage.getItem('tavus-token');
    
    if (savedToken && SecurityUtils.validateApiToken(savedToken)) {
      return savedToken;
    }
    
    // Use config token if available and valid
    if (config.tavusApiKey && SecurityUtils.validateApiToken(config.tavusApiKey)) {
      return config.tavusApiKey;
    }
    
    logger.warn('No valid API token found');
    return null;
  } catch (error) {
    logger.error('Error getting initial token', error);
    return null;
  }
};

// Atom to store the API token
export const apiTokenAtom = atom<string | null>(getInitialToken());

// Atom to track if token is being validated
export const isValidatingTokenAtom = atom(false);

// Derived atom to check if token exists and is valid
export const hasTokenAtom = atom((get) => {
  const token = get(apiTokenAtom);
  return token !== null && SecurityUtils.validateApiToken(token);
});

// Action atom to set token with validation
export const setApiTokenAtom = atom(null, (_, set, token: string) => {
  try {
    if (!SecurityUtils.validateApiToken(token)) {
      logger.error('Invalid API token format provided');
      throw new Error('Invalid API token format');
    }
    
    localStorage.setItem('tavus-token', token);
    set(apiTokenAtom, token);
    logger.info('API token updated successfully');
  } catch (error) {
    logger.error('Error setting API token', error);
    throw error;
  }
});

// Action atom to clear token
export const clearApiTokenAtom = atom(null, (_, set) => {
  try {
    localStorage.removeItem('tavus-token');
    set(apiTokenAtom, null);
    logger.info('API token cleared');
  } catch (error) {
    logger.error('Error clearing API token', error);
  }
});