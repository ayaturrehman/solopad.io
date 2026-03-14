# Product Interface Guidelines

## Contents

- Core mindset
- Visual system rules
- Layout and hierarchy rules
- Product workflow rules
- Component guidance
- Page patterns
- Responsive behavior
- Final review checklist

## Core mindset

- Design with purpose. Give every section, divider, icon, button, and layout decision a clear reason.
- Solve the workflow before styling the surface.
- Prefer calm, smart, practical, premium, and professional decisions over novelty.
- Treat the interface as a product tool, not a poster.
- Reduce friction, reduce noise, and reduce repeated information.
- Favor clarity and consistency over decoration.

## Visual system rules

- Keep the UI clean, minimal, simple, functional, and business-ready.
- Avoid full dull grey, full black, or muddy visual treatment unless the user explicitly asks for it.
- Avoid random gradients and decorative effects that do not support hierarchy or brand.
- Avoid unnecessary cards. Use them only when they materially improve grouping, scanning, or separation.
- Avoid unnecessary shadows. Prefer contrast, spacing, and alignment first.
- Keep corner radius restrained. Avoid heavily rounded surfaces unless the brand clearly uses them.
- Keep borders subtle and limited. Do not outline everything just to create structure.
- Build structure with whitespace, typography, grouping, alignment, and contrast.

## Color rules

- Respect and use the provided or existing brand colors as the primary visual identity.
- Use brand colors intentionally for primary actions, active states, selected states, links, highlights, focus states, and key identity moments.
- Avoid inventing a new palette direction unless the user asks for a rebrand or the existing UI has no usable brand cues.
- Do not overuse accent colors. Neutral surfaces should still carry most of the layout.
- Keep the interface fresh and balanced. Do not let it collapse into flat monochrome grey.

## Typography rules

- Create clear hierarchy across heading, subheading, body, label, and helper text.
- Keep text easy to scan and easy to read.
- Avoid oversized headings without a layout reason.
- Avoid tiny unreadable secondary text.
- Use typography to create rhythm and structure before adding visual containers.
- Make dense business screens feel ordered and calm rather than loud.

## Layout and hierarchy rules

- Design responsively from the start.
- Keep layouts balanced, aligned, and consistent across the page.
- Use one spacing system across sections, components, and page edges.
- Separate sections clearly without overboxing everything.
- Avoid cramped layouts and oversized empty gaps.
- Group related information together and move secondary content out of the critical path.
- Put the most important action where the user will look first.
- Remove duplicate summaries, duplicate KPIs, and repeated labels unless they are genuinely useful in context.

## Product workflow rules

- Think about how a real user uses the screen every day.
- Make the primary action obvious without making the whole screen loud.
- Put filters near the content they change.
- Keep forms linear and logical. Break up complexity with sections only when the sections reflect the user task.
- Keep tables practical: readable columns, meaningful row actions, obvious sorting and filtering, and useful empty states.
- Keep detail pages focused on the record and its next actions instead of repeating overview content.
- Avoid design patterns that look impressive in screenshots but slow down actual use.

## Component guidance

### Buttons and actions

- Make primary actions strong, clear, and easy to find.
- Keep secondary and tertiary actions visually quieter but still discoverable.
- Avoid too many equal-weight buttons in the same area.

### Inputs and forms

- Use clear labels, useful helper text, and obvious validation states.
- Keep field groupings meaningful and short.
- Avoid long unbroken forms when steps, sections, or progressive disclosure would help.
- Keep submit and cancel actions easy to find.

### Tables and lists

- Optimize for scanning first.
- Use spacing, type weight, and column hierarchy to guide the eye.
- Keep bulk actions, filters, and pagination practical and unobtrusive.
- Do not wrap tables in extra cards unless it improves usability.

### Badges and status

- Make status clear but not overly saturated or distracting.
- Use consistent color meaning across the product area.

### Modals, drawers, and side panels

- Keep them lightweight and structured.
- Use them for focused tasks, quick edits, confirmations, or supporting details.
- Do not move a full complex workflow into a cramped modal without a good reason.

## Page patterns

### Dashboards and overview pages

- Show only the metrics, trends, tasks, and recent activity that help the user decide what to do next.
- Avoid stacking many unrelated cards just to fill space.
- Prefer a few high-value sections with clear hierarchy over a wall of widgets.
- Do not repeat the same summary in header, cards, and charts unless each repetition serves a different purpose.

### Tables, lists, and index pages

- Keep the page title, core filters, search, and creation action tightly organized at the top.
- Use compact but readable row density.
- Surface the most common row actions without overwhelming the table.
- Move advanced filters or bulk tools into secondary controls when appropriate.

### Forms and settings pages

- Organize fields by user task or mental model, not by backend schema.
- Keep labels visible and helper text concise.
- Use progressive disclosure for advanced settings.
- End each section with a clear action when the workflow benefits from it.

### Detail pages

- Anchor the page around the record identity, current status, and next actions.
- Use secondary metadata to support the main task, not compete with it.
- Avoid repeating all summary information from the list page unless it is necessary for decision-making here.

### Landing and marketing pages

- Keep the message clear and the flow intentional.
- Use clean hierarchy, strong headline logic, and focused calls to action.
- Avoid decorative product-marketing patterns that fight with usability or brand trust.

## Responsive behavior

- Reorganize layouts for tablet and mobile instead of shrinking the same desktop composition.
- Collapse multi-column layouts into clear vertical order based on user priority.
- Keep filters, tables, and action bars usable on smaller screens.
- Preserve hierarchy, spacing rhythm, and tap target clarity across breakpoints.
- Test whether important actions stay visible without excessive scrolling.

## Final review checklist

- Does every section earn its place?
- Is the primary action obvious?
- Is information grouped by user task?
- Is there any duplicated information that should be merged or removed?
- Are cards, borders, shadows, and containers justified by usability?
- Are brand colors used intentionally instead of everywhere?
- Is typography hierarchy doing enough work?
- Does the screen feel clean, modern, and professional without decorative tricks?
- Does the layout still make sense on tablet and mobile?
- Would this screen hold up under daily use by a real product team?
