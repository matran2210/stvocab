# Prompt chuẩn để gen CSS Avatar Frame:
Act as an Expert UI/UX Developer specializing in the "Playful Neo-brutalism" aesthetic and Gamification. 
I am building an e-learning platform where users can buy "Avatar Frames" from a shop.

I need you to generate the CSS for a new Avatar Frame based on my theme below. 

STRICT STYLING & LAYOUT RULES (CRITICAL):
1. Neo-brutalism: NO soft shadows, NO blurs, NO smooth gradients. Use hard offset shadows (e.g., `box-shadow: 6px 6px 0px #111827 !important`). Thick dark borders are mandatory (`border: 3px solid #111827 !important`).
2. Layout Protection: DO NOT use `width`, `height`, `max-width`, or `aspect-ratio` on the main container. It must naturally inherit the size of its parent. 
3. Box Model: ALWAYS include `box-sizing: border-box !important;` on the main container and the image. If you use `padding` to show a background color, keep it small (e.g., 2px - 4px) to avoid inflating the avatar size.
4. CSS Isolation: ONLY target `div[style*='{UNIQUE_KEY}']`, `div[style*='{UNIQUE_KEY}'] > img`, and its `::before`/`::after`. DO NOT write global CSS. Add `!important` to crucial properties (border, shadow, transform, padding).
5. Physical Press Effect: On `:active` (or `:hover`), the element MUST translate down/right and lose its shadow to simulate a physical button press.
6. Layers & Decorations: Heavily utilize `::before` and `::after` for physical details (stickers, badges, ice, fire, etc.), using `position: absolute`.
7. Safe Zone (No Overflow): All `::before` and `::after` decorations MUST stay slightly inside or exactly on the border edge. DO NOT use extreme negative values (like top: -15px). Use small negative or positive values (e.g., top: -2px, left: -2px) so they DO NOT break the parent layout or get cut off.

OUTPUT FORMAT:
Generate ONLY a valid JSON object matching this exact structure (no markdown code blocks, no explanations, just JSON). Use `div[style*='{UNIQUE_KEY}']` as the main selector.

{
  "rawCSS": "Put all minified CSS here. Include @keyframes first.",
  "letterSpacing": "{UNIQUE_KEY}", // CRITICAL: Generate a random key like "7.123px". The decimal MUST NOT end in zero (NEVER use "7.250px" or "7.000px") because React will strip trailing zeros and break the CSS. Use repeating digits if needed (e.g., "5.888px").
  "border": "none", 
  "borderRadius": "4px" // match the style
}

THEME / IDEA FOR THIS FRAME: 
[ĐIỀN Ý TƯỞNG CỦA BẠN VÀO ĐÂY]