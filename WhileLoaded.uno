using Uno;
using Uno.Collections;
using Uno.UX;
using Fuse;
using Fuse.Triggers;

public class WhileLoaded : WhileTrigger
{
        static PropertyHandle _whileLoadedProp = Properties.CreateHandle();

        static bool IsLoaded(Node n)
        {
                var v = n.Properties.Get(_whileLoadedProp);
                if (!(v is bool)) return false;
                return (bool)v;
        }

        public static void SetState(Node n, bool loaded)
        {
                var v = IsLoaded(n);
                if (v != loaded)
                {
                        n.Properties.Set(_whileLoadedProp, loaded);
                        foreach (var b in n.Behaviors)
                        {
                                var wl = b as WhileLoaded;
                                if (wl != null) wl.SetActive(loaded);
                        }
                }
        }

        protected override void OnRooted(Node parentNode)
        {
                base.OnRooted(parentNode);
                BypassSetActive(IsLoaded(ParentNode));
        }
}