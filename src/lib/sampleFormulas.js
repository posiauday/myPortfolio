/* Real, correctly-typed Power Fx literals for every Table/Record/Color
   custom property in the catalog, keyed by "ComponentTitle::PropertyName".

   componentLibrary.js's own `def` field for these properties is prose
   shorthand meant for the Properties tab's prose ("12-point sample",
   "Sample orders") — never a literal anyone could paste. Feeding that
   text straight into a DataType: Table/Record/Color property's Default
   is a type mismatch Studio's real compiler would reject (the same
   family of bug the Event ReturnType/Default fix caught), and even
   where it wouldn't outright error, an empty/placeholder Default is
   also how Studio infers a Table/Record property's column schema the
   first time the component is created — get it wrong and the property
   is permanently the wrong shape.

   A "Blank" prose default means the property is genuinely meant to
   start empty, not that it has no schema — those use
   `Filter(Table({col: ...}), false)`, a real, standard Power Fx
   pattern for a correctly-typed-but-empty table (build one throwaway
   row so the columns exist, then filter it away). */

export const SAMPLE_FORMULAS = {
  // IconColor pairs each with an IconBg tint; in the Filled variant
  // IconColor becomes the card's own text color on that same IconBg
  // background, so these are picked to clear WCAG 1.4.3 (4.5:1) as that
  // pairing, not just to look like a plausible brand color — a real
  // axe-core run against the Filled variant caught the original,
  // lighter Material-palette IconColor values (e.g. #2196F3) failing
  // exactly that pairing.
  "KPI Card::Icons": "Table({Name:\"Box\",SVG:\"<svg viewBox='0 0 24 24' width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='COLOR' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/><polyline points='3.29 7 12 12 20.71 7'/><line x1='12' y1='22' x2='12' y2='12'/></svg>\"},{Name:\"TrendLines\",SVG:\"<svg viewBox='0 0 24 24' width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='COLOR' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='22 12 18 12 15 21 9 3 6 12 2 12'/></svg>\"},{Name:\"Package\",SVG:\"<svg viewBox='0 0 24 24' width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='COLOR' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/><polyline points='3.29 7 12 12 20.71 7'/><line x1='12' y1='22' x2='12' y2='12'/></svg>\"},{Name:\"Warning\",SVG:\"<svg viewBox='0 0 24 24' width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='COLOR' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12.01' y2='17'/></svg>\"},{Name:\"Dollar\",SVG:\"<svg viewBox='0 0 24 24' width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='COLOR' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='12' y1='1' x2='12' y2='23'/><path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/></svg>\"},{Name:\"Users\",SVG:\"<svg viewBox='0 0 24 24' width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='COLOR' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/></svg>\"},{Name:\"Clock\",SVG:\"<svg viewBox='0 0 24 24' width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='COLOR' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/></svg>\"},{Name:\"BarChart\",SVG:\"<svg viewBox='0 0 24 24' width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='COLOR' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='18' y1='20' x2='18' y2='10'/><line x1='12' y1='20' x2='12' y2='4'/><line x1='6' y1='20' x2='6' y2='14'/></svg>\"})",
  "KPI Card::StyleConfig": '{colors:{cardBg:ColorValue("#FFFFFF"),border:ColorValue("#E5E7EB"),text:ColorValue("#111827"),textMuted:ColorValue("#6B7280"),positive:ColorValue("#22C55E"),negative:ColorValue("#EF4444"),neutral:ColorValue("#9E9E9E"),skeletonBase:ColorValue("#E5E7EB"),skeletonShine:ColorValue("#F3F4F6")},space:{xs:4,sm:8,md:12,lg:16,xl:24},radius:{md:8,lg:12},type:{value:{size:32,sizeCompact:20},label:{size:12},body:{size:12}},heights:{statsCardMax:190,statsCardCompact:88},abbreviateThreshold:10000}',
  "Responsive Line Chart::ChartData": 'Table({x:1,y:42,label:"Jan"},{x:2,y:48,label:"Feb"},{x:3,y:45,label:"Mar"},{x:4,y:58,label:"Apr"})',
  "Command Card::Metrics": 'Table({Label:"Health",Value:"74%",Tone:"Positive"},{Label:"Active",Value:"32",Tone:"Neutral"},{Label:"At risk",Value:"06",Tone:"Negative"})',
  "Command Card::ChartData": "Table({x:1,y:12},{x:2,y:18},{x:3,y:15},{x:4,y:22},{x:5,y:19},{x:6,y:25},{x:7,y:21},{x:8,y:28})",
  "Program Scorecard::Metrics": 'Table({Name:"Budget",Value:82,Target:90,Tone:"Green"},{Name:"Schedule",Value:68,Target:80,Tone:"Amber"},{Name:"Quality",Value:74,Target:85,Tone:"Green"},{Name:"Scope",Value:55,Target:75,Tone:"Red"},{Name:"Risk",Value:70,Target:80,Tone:"Amber"},{Name:"Team",Value:88,Target:85,Tone:"Green"})',
  "Operational Status Banner::AffectedSystems": 'Filter(Table({Name:"Sample"}),false)',
  "Risk Matrix::Risks": "Table({Likelihood:1,Impact:1,Count:1},{Likelihood:1,Impact:2,Count:2},{Likelihood:1,Impact:3,Count:1},{Likelihood:2,Impact:1,Count:3},{Likelihood:2,Impact:2,Count:4},{Likelihood:2,Impact:3,Count:2},{Likelihood:3,Impact:1,Count:1},{Likelihood:3,Impact:2,Count:3},{Likelihood:3,Impact:3,Count:5})",
  "Project Health Summary::Dimensions": 'Table({Dimension:"Scope",Tone:"Green",Note:"On track",TrendDirection:"Same"},{Dimension:"Schedule",Tone:"Amber",Note:"Slipping slightly",TrendDirection:"Worse"},{Dimension:"Budget",Tone:"Green",Note:"Under budget",TrendDirection:"Better"},{Dimension:"Quality",Tone:"Red",Note:"Defect backlog rising",TrendDirection:"Worse"})',
  "Milestone Tracker::Milestones": 'Table({Name:"Kickoff",DueDate:Date(2026,1,10),Status:"Complete",CompletedDate:Date(2026,1,9)},{Name:"Design sign-off",DueDate:Date(2026,2,15),Status:"Complete",CompletedDate:Date(2026,2,14)},{Name:"Beta release",DueDate:Date(2026,4,1),Status:"OnTrack",CompletedDate:Blank()},{Name:"UAT",DueDate:Date(2026,5,10),Status:"AtRisk",CompletedDate:Blank()},{Name:"Go-live",DueDate:Date(2026,6,1),Status:"OnTrack",CompletedDate:Blank()},{Name:"Hypercare exit",DueDate:Date(2026,6,30),Status:"Missed",CompletedDate:Blank()})',
  "Decision Log::Decisions": 'Table({Date:Date(2026,1,5),Decision:"Adopt Dataverse for storage",Owner:"Jordan Lee",Status:"Decided",Rationale:"Governed, scalable, integrates with Power Platform"},{Date:Date(2026,1,20),Decision:"Use Creator Kit controls",Owner:"Jordan Lee",Status:"Decided",Rationale:"Reduces custom build time"},{Date:Date(2026,2,2),Decision:"Defer offline mode",Owner:"Jordan Lee",Status:"Open",Rationale:"Awaiting business case"},{Date:Date(2026,2,10),Decision:"Single sign-on via Entra ID",Owner:"Jordan Lee",Status:"Decided",Rationale:"Matches org security standard"},{Date:Date(2026,3,1),Decision:"Replace legacy SharePoint list",Owner:"Jordan Lee",Status:"Superseded",Rationale:"Migrated to Dataverse table instead"})',
  "Deadline Tracker::Holidays": 'Table({HolidayName:"New Year\'s Day",HolidayDate:Date(2026,1,1)},{HolidayName:"Memorial Day",HolidayDate:Date(2026,5,25)},{HolidayName:"Independence Day",HolidayDate:Date(2026,7,4)},{HolidayName:"Labor Day",HolidayDate:Date(2026,9,7)},{HolidayName:"Thanksgiving Day",HolidayDate:Date(2026,11,26)},{HolidayName:"Christmas Day",HolidayDate:Date(2026,12,25)})',
  "Deadline Tracker::Config": '{CountMode:"BusinessDays",WorkingDays:Table({Day:1},{Day:2},{Day:3},{Day:4},{Day:5}),DueSoonThreshold:3,Compact:false}',
  "Activity Timeline::Items": 'Table({Title:"Project created",Description:"Initial workspace set up",Author:"Jordan Lee",Timestamp:Now(),Category:"System"},{Title:"Status updated",Description:"Marked On track",Author:"Jordan Lee",Timestamp:DateAdd(Now(),-1,Days),Category:"Update"})',
  "Activity Timeline::FilterOptions": 'Table({Category:"System"},{Category:"Update"},{Category:"Comment"},{Category:"Approval"},{Category:"Milestone"},{Category:"Alert"})',
  "Activity Timeline::IconMap": 'Table({Category:"System",Icon:"Gear",Color:RGBA(100,100,100,1)},{Category:"Update",Icon:"Refresh",Color:RGBA(15,108,189,1)},{Category:"Comment",Icon:"Comment",Color:RGBA(22,131,38,1)},{Category:"Approval",Icon:"CheckMark",Color:RGBA(16,124,16,1)},{Category:"Milestone",Icon:"Flag",Color:RGBA(202,80,16,1)},{Category:"Alert",Icon:"Warning",Color:RGBA(197,58,58,1)})',
  "Activity Timeline::PinnedIds": 'Filter(Table({Id:""}),false)',
  "Calendar::Events": 'Filter(Table({Title:"",Date:Date(2026,1,1),SeriesId:""}),false)',
  "Calendar::Channels": 'Table({Key:"work",Title:"Work",Color:RGBA(15,108,189,1)},{Key:"personal",Title:"Personal",Color:RGBA(22,131,38,1)})',
  "Calendar::Holidays": 'Filter(Table({Date:Date(2026,1,1),Name:""}),false)',
  "Calendar::Config": "{RowHeight:96,ChipSlots:3,FirstDayOfWeek:1,WorkHoursStart:9,WorkHoursEnd:17,ShowWeekNumbers:false,ShowHolidayTint:true}",
  "Accordion List::Groups": 'Table({GroupKey:1,Title:"Order 1042",Locked:false},{GroupKey:2,Title:"Order 1043",Locked:false},{GroupKey:3,Title:"Order 1044",Locked:true})',
  "Accordion List::Items": 'Table({GroupKey:1,Line:"Widget A x2",Locked:false},{GroupKey:1,Line:"Widget B x1",Locked:false},{GroupKey:2,Line:"Gadget C x5",Locked:false},{GroupKey:3,Line:"Part D x10",Locked:true})',
  "Accordion List::Config": "{ShowHeader:true,ShowTags:true,ShowMeta:true,ShowExpandAll:true,AllowReorder:true,AllowEdit:true,AllowDelete:true}",
  "Data Table::Items": 'Table({Id:1,Name:"Task A",Status:"Active",Priority:"High",CompletedSteps:3,TotalSteps:5},{Id:2,Name:"Task B",Status:"Done",Priority:"Normal",CompletedSteps:5,TotalSteps:5})',
  "Data Table::ContextMenuItems": 'Table({Key:"view",Label:"View",Enabled:true,Visible:true},{Key:"edit",Label:"Edit",Enabled:true,Visible:true},{Key:"delete",Label:"Delete",Enabled:true,Visible:true})',
  "Data Table::StatusConfig": 'Table({Status:"Active",Color:RGBA(15,108,189,1)},{Status:"Done",Color:RGBA(16,124,16,1)},{Status:"Blocked",Color:RGBA(197,58,58,1)},{Status:"Default",Color:RGBA(120,120,120,1)})',
  "Data Table::PriorityConfig": 'Table({Priority:"High",Color:RGBA(197,58,58,1)},{Priority:"Normal",Color:RGBA(15,108,189,1)},{Priority:"Low",Color:RGBA(120,120,120,1)},{Priority:"Default",Color:RGBA(120,120,120,1)})',
  "File Upload::Items": 'Table({Id:1,Name:"Statement-of-Work.pdf",SizeBytes:245000,UploadedOn:Date(2026,1,12),UploadedBy:"Jordan Lee",Ext:"pdf"})',
  "File Upload::AllowedExtensions": 'Filter(Table({Ext:""}),false)',
  "Email Composer::Directory": 'Table({DisplayName:"Jordan Lee",Mail:"jordan.lee@example.com",JobTitle:"Power Platform Architect"})',
  "Email Composer::Attachments": "Filter(Table({Id:1,Name:\"\",SizeBytes:0}),false)",
  "Comments & Mentions::Comments": 'Table({Author:"Jordan Lee",Text:"Looks good, ready for review.",Timestamp:Now(),ParentId:Blank()},{Author:"Alex Chen",Text:"Thanks, addressing the last comment now.",Timestamp:DateAdd(Now(),-1,Hours),ParentId:1})',
  "Comments & Mentions::Directory": 'Table({DisplayName:"Jordan Lee",Mail:"jordan.lee@example.com"})',
  "Sidebar::Items": 'Table({Id:1,ParentId:Blank(),Label:"Dashboard",ItemBadgeCount:0,ItemIconColor:RGBA(22,131,38,1)},{Id:2,ParentId:Blank(),Label:"Projects",ItemBadgeCount:3,ItemIconColor:RGBA(15,108,189,1)})',
  "Responsive Breadcrumbs::Items": 'Table({Label:"Home",Key:"home",ItemClickable:true},{Label:"Projects",Key:"projects",ItemClickable:true},{Label:"Portfolio Command",Key:"portfolio-command",ItemClickable:true},{Label:"Q3 Review",Key:"q3-review",ItemClickable:true},{Label:"Details",Key:"details",ItemClickable:false})',
  "Mega Menu::MenuItems": 'Table({ID:1,Label:"Products",HasDropdown:true,Link:""},{ID:2,Label:"Pricing",HasDropdown:false,Link:"/pricing"})',
  "Mega Menu::DropdownItems": 'Table({MenuID:1,Section:"Platform",Column:1,Label:"Power Apps",Badge:Blank()},{MenuID:1,Section:"Platform",Column:1,Label:"Power Automate",Badge:Blank()},{MenuID:1,Section:"New",Column:2,Label:"Copilot Studio",Badge:"New"})',
  "Mega Menu::ActiveColor": "RGBA(22,131,38,1)",
  "Approval Journey::Stages": 'Table({Approver:"Jordan Lee",Status:"Approved",RespondedOn:Date(2026,1,10),DueDate:Blank(),DelegatedTo:Blank()},{Approver:"Alex Chen",Status:"Pending",RespondedOn:Blank(),DueDate:Date(2026,1,20),DelegatedTo:Blank()},{Approver:"Sam Rivera",Status:"Rejected",RespondedOn:Date(2026,1,12),DueDate:Blank(),DelegatedTo:Blank()})',
  "Process Stepper::Steps": 'Table({Label:"Request",Status:"Complete"},{Label:"Review",Status:"Complete"},{Label:"Approve",Status:"Current"},{Label:"Provision",Status:"Upcoming"},{Label:"Close",Status:"Upcoming"})',
  "Route Map::Nodes": 'Table({Label:"Intake",Status:"Complete",Order:1,Lane:Blank()},{Label:"Triage",Status:"Complete",Order:2,Lane:Blank()},{Label:"Build",Status:"Active",Order:3,Lane:"Engineering"},{Label:"Test",Status:"Pending",Order:4,Lane:"QA"},{Label:"Deploy",Status:"Pending",Order:5,Lane:"Engineering"},{Label:"Close",Status:"Blocked",Order:6,Lane:Blank()})',
  "Route Map::Connections": "Table({From:1,To:2},{From:2,To:3},{From:3,To:4},{From:3,To:5},{From:4,To:6},{From:5,To:6})",
  "Range Slider::Zones": 'Table({Label:"On track",UpTo:70,Color:RGBA(16,124,16,1)},{Label:"Watch",UpTo:90,Color:RGBA(202,140,16,1)},{Label:"Over",UpTo:100,Color:RGBA(197,58,58,1)})',
  "Detail Panel::Buttons": 'Table({Label:"Cancel",ButtonType:"Standard"},{Label:"Save",ButtonType:"Primary"})',
  "Detail Panel::OverlayColor": "RGBA(0,0,0,0.4)",
  "Detail Panel::SelectedButton": "{Label:Blank(),ButtonType:Blank()}"
};
