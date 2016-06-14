using Uno;
using Uno.Collections;
using Uno.UX;
using Fuse;
using Fuse.Triggers;

public class WhileCacheLoaded : WhileTrigger
{
        static PropertyHandle _whileCacheLoadedProp = Properties.CreateHandle();

        static bool IsCacheLoaded(Visual n)
        {
                var v = n.Properties.Get(_whileCacheLoadedProp);
                if (!(v is bool)) return false;
                return (bool)v;
        }

        public static void SetState(Visual n, bool cacheLoaded)
        {
                var v = IsCacheLoaded(n);
                if (v != cacheLoaded)
                {
                        n.Properties.Set(_whileCacheLoadedProp, cacheLoaded);
                        if (n.IsRootingCompleted)
                        {
                                for (int i=0; i < n.Children.Count; i++)
                                {
                                        var wl = n.Children[i] as WhileCacheLoaded;
                                        if (wl != null) { wl.SetActive(cacheLoaded); }
                                }
                        }
                }
        }

        protected override void OnRooted()
        {
                base.OnRooted();
                SetActive(IsCacheLoaded(Parent));
        }
}