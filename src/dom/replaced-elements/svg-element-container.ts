import {ElementContainer} from '../element-container';
import {CacheStorage} from '../../core/cache-storage';

export class SVGElementContainer extends ElementContainer {
    svg: string;
    intrinsicWidth: number;
    intrinsicHeight: number;

    constructor(img: SVGSVGElement) {
        super(img);
        const textElem = img.getElementsByTagName('text');
        for (let i = 0; i < textElem.length; i++) {
            const e = textElem[i];
            if (window.getComputedStyle(img, null).getPropertyValue('font-family')) {
                e.setAttribute(
                    'font-family',
                    window.getComputedStyle(img, null).getPropertyValue('font-family')
                );
                e.replaceWith(e);
            }
        }
        const s = new XMLSerializer();
        this.svg = `data:image/svg+xml,${encodeURIComponent(s.serializeToString(img))}`;
        this.intrinsicWidth = img.width.baseVal.value;
        this.intrinsicHeight = img.height.baseVal.value;

        CacheStorage.getInstance().addImage(this.svg);
    }
}
