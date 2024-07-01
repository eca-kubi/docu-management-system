import {useState, useCallback, useEffect, useRef} from 'react';
import {useScreenSize} from './media-query';

export function useMenuPatch() {
    const {isSmall, isMedium} = useScreenSize();
    const [enabled, setEnabled] = useState(isSmall || isMedium);
   // const isMounted = useRef(true);

/*    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);*/
    const onMenuReady = useCallback(() => {
        try {
            if (!enabled) {
                return;
            }
            setTimeout(() => setEnabled(false));
        } catch (error) {
            console.error('Error in onMenuReady:', error);
        }
    }, [enabled]);

    return [enabled ? 'pre-init-blink-fix' : '', onMenuReady];
}
