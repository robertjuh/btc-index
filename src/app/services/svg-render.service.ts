import {Injectable} from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class SvgRenderService {

  constructor(
  ) {
  }

  public renderMushroomSVG(color: string): SVGElement {
    const svg: SVGElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("viewBox", "-8 -6 18 18");

    const path: any = document.createElementNS("http://www.w3.org/2000/path", "path");
    path.setAttribute("d", "M 4 9 T -2 9 Q 2 -1 -4 1 A 1.42 1.42 0 0 1 6 1 Q 0 -1 4 9");
    path.setAttribute("stroke", "#FFFFFF");
    path.setAttribute("stroke-width", "#0.8");
    path.setAttribute("fill", color);
    path.setAttribute("fill-opacity", 0.5);
    svg.appendChild(path);

    return svg;
  }

}
