using Uno;
using Uno.Collections;
using Uno.UX;
using Fuse;
using Fuse.Triggers;

public class WhileLoaded : WhileTrigger
{
        static PropertyHandle _whileLoadedProp = Properties.CreateHandle();

        static bool IsLoaded(Visual n)
        {
                var v = n.Properties.Get(_whileLoadedProp);
                if (!(v is bool)) return false;
                return (bool)v;
        }

        public static void SetState(Visual n, bool loaded)
        {
                var v = IsLoaded(n);
                if (v != loaded)
                {
                        n.Properties.Set(_whileLoadedProp, loaded);
                        if (n.IsRootingCompleted)
                        {
                                for (int i=0; i < n.Children.Count; i++)
                                {
                                        var wl = n.Children[i] as WhileLoaded;
                                        if (wl != null) { wl.SetActive(loaded); }
                                }
                        }
                }
        }

        protected override void OnRooted()
        {
                base.OnRooted();
                SetActive(IsLoaded(Parent));
        }
}